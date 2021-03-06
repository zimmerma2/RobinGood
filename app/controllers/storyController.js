var fs = require('fs');
var mongoose = require('mongoose');
var multer = require('multer');
var paginate = require('express-paginate');
var Story = require('../models/story');
var User = require('../models/user');
var url = require('url');

// Load local modules
var storyHelpers = require('../lib/storyHelpers');
var authHelpers = require('../lib/authHelpers');
var isLoggedIn = authHelpers.isLoggedIn;

var ObjectId = mongoose.Types.ObjectId;
const uploadDir = storyHelpers.uploadDir;
const maxThumbnailSize = 1000000;

var thumbnailUpload = multer({
  dest: 'temp/',
  limits: {fileSize: maxThumbnailSize, files:1},
  fileFilter: storyHelpers.imageFilter,
  onFileSizeLimit: function (file) {
    console.log('Failed to upload: ', file.originalname)
    fs.unlink('./' + file.path) // delete the partially written file
  }
}).single('thumbnail');

/**************************************
* Controllers for displaying stories *
**************************************/
exports.story_detail = function story_detail (req, res, next) {
  // Sanitize id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Redirect to 404 if id is invalid
  if (!ObjectId.isValid(req.params.id)) {
    return next();
  }

  Story.findById(req.params.id, function(err,story) {
    if (err) { return next(err);}
    // If no story found, continue request
    if (story === null) {return next();}

    res.render('story/story.pug', {
      title : story.title,
      story : story
    });
  });
};

exports.story_list =  function story_list (req, res, next) {
  res.redirect(url.format({
    pathname:'/story/',
    query: {
      sort:'title'
    }
  }));
}

/****************************************
* Controllers for creating a new story *
****************************************/
exports.story_new_get = [
  // isLoggedIn,
  function story_new_get (req, res) {
    res.render('story/newstory.pug', { title: 'Create a New Story' });
  }
]

exports.story_new_post = function story_new_post (req, res, next) {
  thumbnailUpload(req, res, function (multerError) {

    var errors = story_form_validate(req, checkThumbnail=true, checkLocation=true);

    if (multerError) {
      // Create expressvalidator compatible error
      var newError = {
        'msg' : multerError.code,
        'param' : multerError.field,
        'value' : null,
        'location' : 'body'
      }
      errors.push(newError);
    }

    //Create a story object with escaped and trimmed data.
    var newStory = new Story();
    newStory.title = req.body.title;
    newStory.description = req.body.description;
    newStory.targetDonation = req.body.targetDonation;
    newStory.closingDate = req.body.endDate;
    newStory.location.streetNumber = (req.body.streetNumber) ? req.body.streetNumber : undefined;
    newStory.location.streetAddress = (req.body.streetAddress) ? req.body.streetAddress : undefined;
    newStory.location.city = req.body.city;
    newStory.location.state = req.body.state;
    newStory.location.zipCode = req.body.zipCode;

    if (errors.length) {
      // TODO Look into validating form BEFORE uploading file
      //If there are errors render the form again, passing the previously entered values and errors
      if (req.file != undefined) {
        storyHelpers.deleteUploaded(req.file.path);
      }
      res.render('story/newstory.pug', {
        title :  'Create a New Story',
        errors : errors,
        story : newStory,
        storyBody_md : req.body.storyBody
      });
      return;
    } else {
      // Form data is valid, continue with processing
      newStory.openingDate = new Date();

      const fileExtension = req.file.originalname.split('.').pop();
      newStory.thumbnail = newStory._id + '.' + fileExtension;
      newStory.body_md = newStory._id + '.md';
      newStory.body_html = newStory._id + '.html';

      newStory.save(function(err) {
        if (err){
          console.log('\nError making new story.');
          // Delete uploaded file
          storyHelpers.deleteUploaded(req.file.path);
          return next(err);
        } else {
          // Created story, save related files
          storyHelpers.moveThumbnail(newStory, req, res, next);
          storyHelpers.writeBodyFiles(newStory, req, res, next);

          // Story succesfully created, redirect user to new page
          res.redirect('/story/' + newStory._id);
        }
      });
    }
  })
}

/**************************************
* Controllers for updating the story *
**************************************/
exports.story_update_get = function story_update_get (req, res, next) {
  // Sanitize id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Redirect to 404 if id is invalid
  if (!ObjectId.isValid(req.params.id)) {
    return next();
  }

  Story.findById(req.params.id, function (err,story) {
    if (err) { return next(err);}
    // If no story found, continue request
    if (story === null) {return next();}

    fs.readFile('app/public/stories/markdown/' + story.body_md, 'utf8', function (err,data) {
      if (err) {
        return next(err);
      }

      res.render('story/updatestory.pug', {
        title : 'Edit Story',
        story : story,
        storyBody_md : data
      });
    });
  });
};

exports.story_update_post = function story_update_post (req, res, next) {
  // Sanitize id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Redirect to 404 if id is invalid
  if (!ObjectId.isValid(req.params.id)) {
    return next('route');
  }

  var errors = story_form_validate(req, checkThumbnail=false, checkLocation=false);

  //Create a story object with escaped and trimmed data.
  var story = new Story();

  // Important, or new ID will be assigned!
  story._id = req.params.id;
  story.title = req.body.title;
  story.description = req.body.description;
  story.targetDonation = req.body.targetDonation;
  story.closingDate = req.body.endDate;

  if (errors.length) {
    //If there are errors render the form again, passing the previously entered values and errors
    res.render('story/updatestory.pug', {
      title : 'Edit Story',
      errors : errors,
      story : story,
      storyBody_md : req.body.storyBody
    });
    return;
  } else {
    story.body_md = story._id + '.md';
    story.body_html = story._id + '.html';

    Story.findByIdAndUpdate(req.params.id, story, {}, function (err, story) {
      if (err) {
        console.error('\nError updating story.');
        return next(err);
      }

      //Replace markdown and HTML files
      storyHelpers.deleteUploaded(uploadDir + 'stories/markdown/' + story.body_md);
      storyHelpers.deleteUploaded(uploadDir + 'stories/html/' + story.body_html);
      storyHelpers.writeBodyFiles(story, req, res, next);

      //successful - redirect to story page
      res.redirect('/story/' + story._id);
    });
  }
};

exports.story_delete = function story_delete (req, res, next) {
  // Sanitize id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Redirect to 404 if id is invalid
  if (!ObjectId.isValid(req.params.id)) {
    return next();
  }

  storyHelpers.deleteStory(req.params.id);

  res.redirect('/story/list');
};

/*************************************
 * Controllers for searching stories *
 *************************************/

exports.story_search_get = function story_search_get (req, res) {
  res.render('story/searchstory.pug', { title: 'Search for Stories', query:req.query });
}

exports.story_search_results_get = function story_search_results_get (req, res, next) {

  // Validate query
  if (req.query.endDate) {
    req.checkQuery('endDate','Future closing date is required.').isAfter();
  }

  // Sanitize Query
  req.sanitizeQuery('sq').escape();
  req.sanitizeQuery('sq').trim();
  req.sanitizeQuery('endDate').escape();
  req.sanitizeQuery('endDate').trim();
  req.sanitizeQuery('endDate').toDate();
  req.sanitizeQuery('city').escape();
  req.sanitizeQuery('state').trim();
  req.sanitizeQuery('zipCode').escape();
  req.sanitizeQuery('zipCode').trim();
  req.sanitizeQuery('zipCode').toInt();

  var errors = req.validationErrors();

  if (errors) {
    //If there are errors render the form again, passing the previously entered values and errors
    res.render('story/searchstory.pug', {
      title : 'Search for Stories',
      errors : errors,
      query : req.query,
    });
    return;
  } else {

    var options = {
      sort: (req.query.sort) ? req.query.sort : 'title',
      page: req.query.page,
      limit: req.query.limit,
    };

    var mongo_query = {};

    if (req.query.sq) {
      mongo_query['$text'] = { $search: req.query.sq }
    }

    if (req.query.endDate) {
      mongo_query['closingDate'] = {
        $lte: new Date(req.query.endDate)
      }
    }

    if (req.query.city) {
      mongo_query['location.city'] = req.query.city
    }

    if (req.query.state) {
      mongo_query['location.state'] = req.query.state
    }

    if (req.query.zipCode) {
      mongo_query['location.zipCode'] = req.query.zipCode
    }

    var search_url = url.format({
      pathname:'/story/search',
      query: req.query
    });

    Story.paginate(mongo_query, options, function(err, stories) {
      if (err) return next(err);
      res.render('story/storysearchresults.pug', {
        title: 'Stories',
        stories: stories.docs,
        pageCount: stories.pages,
        itemCount: stories.limit,
        pages: paginate.getArrayPages(req)(3, stories.pages, req.query.page),
        query: req.query,
        search_url: search_url,
      });
    });
  }
}

/********************
 * Helper Functions *
 ********************/
function story_form_validate(req, checkThumbnail=true, checkLocation=true) {
  // TODO there must be a better way!
  req.body.thumbnail = req.file;

  // Validate form entries
  req.checkBody('title','Story title is required.').notEmpty();
  req.checkBody('description','Story description is required.').notEmpty();
  req.checkBody('targetDonation','Target donation must be specified.').notEmpty();
  req.checkBody('endDate','Future closing date is required.').isAfter();
  req.checkBody('storyBody','Story body is required.').notEmpty();

  if (checkThumbnail) {
    req.checkBody('thumbnail.originalname','Thumbnail is required.').notEmpty();
    if (req.file != undefined)
      req.checkBody('thumbnail.originalname','Thumbnail must be an image file.').isImage();
  }

  if (checkLocation) {
    req.checkBody('city','City is required.').notEmpty();
    req.checkBody('state','State is required.').notEmpty();
    req.checkBody('zipCode','ZIP code is required.').notEmpty();
    req.checkBody('zipCode','A ZIP code must have 5 digits.').isLength({min: 5, max: 5});
  }

  // Sanitize form entries
  req.sanitize('title').escape();
  req.sanitize('title').trim();
  req.sanitize('description').escape();
  req.sanitize('description').trim();
  req.sanitize('targetDonation').escape();
  req.sanitize('targetDonation').toFloat();
  req.sanitize('endDate').escape();
  req.sanitize('endDate').toDate();
  req.sanitize('storyBody').escape();
  req.sanitize('storyBody').trim();

  if (checkLocation) {
    req.sanitize('city').escape();
    req.sanitize('city').trim();
    req.sanitize('state').escape();
    req.sanitize('state').trim();
    req.sanitize('zipCode').escape();
    req.sanitize('zipCode').trim();
    req.sanitize('zipCode').toInt();
    req.sanitize('streetAddress').escape();
    req.sanitize('streetAddress').trim();
    req.sanitize('streetNumber').escape();
    req.sanitize('streetNumber').trim();
    req.sanitize('streetNumber').toInt();
  }

  // Run the validators
  var errors = req.validationErrors();

  // Ensure an array is returned
  return (errors) ? errors: [];
}
