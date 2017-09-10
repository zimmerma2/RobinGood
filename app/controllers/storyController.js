var fs = require('fs');
var mongoose = require('mongoose');
var multer = require('multer');
var Story = require('../models/story');

// Load local modules
var storyHelpers = require('../lib/storyHelpers');

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

    res.render('story.pug', {
      title : story.title,
      story : story,
    });
  });
};

exports.story_list =  function story_list (req, res, next) {
  // Sort by title, descending
  Story.find().sort({title : 1}).exec(function(err,stories) {
    if (err) {return next(err);}
    res.render('storylist.pug', {
      title : 'Stories',
      storylist : stories
    });
  });
}

/****************************************
* Controllers for creating a new story *
****************************************/
exports.story_new_get = function story_new_get (req, res) {
  res.render('newstory.pug', { title: 'Create a New Story' });
}

exports.story_new_post = function story_new_post (req, res, next) {
  thumbnailUpload(req, res, function (multerError) {

    console.log("BODY:");
    console.log(req.body);


    var errors = story_form_validate(req, true, true);

    if (multerError) {
      console.error('MULTER ERROR: ');
      console.error(multerError);

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

    if (errors.length) {
      // TODO Look into validating form BEFORE uploading file
      //If there are errors render the form again, passing the previously entered values and errors
      if (req.file != undefined) {
        storyHelpers.deleteUploaded(req.file.path);
      }
      res.render('newstory.pug', {
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

      res.render('updatestory.pug', {
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

  var errors = story_form_validate(req, false, false);

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
    res.render('updatestory.pug', {
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

/********************
* Helper Functions *
********************/
function story_form_validate(req, checkThumbnail, checkLocation) {
  // TODO there must be a better way!
  req.body.thumbnail = req.file;

  // Validate form entries
  req.checkBody('title','Story title is required.').notEmpty();
  req.checkBody('description','Story description is required.').notEmpty();
  req.checkBody('targetDonation','Target donation must be specified.').notEmpty();
  req.checkBody('endDate','Valid closing date is required.').isAfter();
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
    req.sanitize('city').escape();
    req.sanitize('state').escape();
    req.sanitize('state').trim();
    req.sanitize('zipCode').escape();
    req.sanitize('zipCode').trim();
    req.sanitize('zipCode').toInt();
  }

  // Validate thumbnail

  // Run the validators
  var errors = req.validationErrors();

  // Ensure an array is returned
  return (errors) ? errors: [];
}
