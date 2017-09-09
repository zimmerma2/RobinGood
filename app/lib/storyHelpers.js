var fs = require('fs');
var marked = require('marked');
var Story = require('../models/story');

const uploadDir = 'app/public/'

/********************************
* Functions for handling files *
********************************/
// Only accept images
function imageFilter(req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    console.error("Not an image file: ", file.originalname);
    cb(new Error('_INVALID_IMAGE_'), false);
  }
  cb(null, true);
};

function moveThumbnail(newStory, req, res, next) {
  const thumbPath = uploadDir + 'thumbnails/' + newStory.thumbnail;

  fs.rename(req.file.path, thumbPath, function(err) {
    if (err) {return next(err)};
    console.log("\nStory created!\nID: " + newStory._id);
    console.log("Moved thumbnail to: " + thumbPath);
  });
}

function deleteUploaded(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, function(err) {
      if (err) throw err;
      console.log("\nDeleted uploaded file at: ", filePath);
    });
  } else {
    console.log("File, '" + filePath + "' does not exist.");
  }
};

function writeBodyFiles(newStory, req, res, next) {
  const bodyPath_md = uploadDir + 'stories/markdown/' + newStory.body_md;
  const bodyPath_html = uploadDir + 'stories/html/' + newStory.body_html;

  // Save story body - markdown
  fs.writeFile(bodyPath_md, req.body.storyBody, function (err) {
    if (err) {
      console.log('\nError writing file: ', bodyPath_md);
      // Delete uploaded file
      deleteUploaded(thumbPath);
      return next(err);
    }
    console.log('Wrote story body markdown to: ', bodyPath_md)
  });

  // Save story body - html
  var body_html = marked(req.body.storyBody);
  fs.writeFile(bodyPath_html, body_html, function (err) {
    if (err) {
      console.log('\nError writing file: ', bodyPath_html);
      // Delete uploaded files
      deleteUploaded(thumbPath);
      deleteUploaded(bodyPath_md);
      return next(err);
    }
    console.log('Wrote story body html to: ', bodyPath_html)
  });
};

/***************************************
* Functions for managing the database *
***************************************/
function deleteStory(id) {
  Story.findById(id, function deleteStoryFiles(err, story) {
    if (err) throw err;
    // If no story found, continue request
    if (story === null) {
      console.error("No story with the the _id '" + id + "' exists.");
      return false;
    }

    deleteUploaded(uploadDir + 'thumbnails/' + story.thumbnail);
    deleteUploaded(uploadDir + 'stories/markdown/' + story.body_md);
    deleteUploaded(uploadDir + 'stories/html/' + story.body_html);
  });

  Story.findByIdAndRemove(id, function (err) {
    if (err) throw err;
    //Success
    console.log("Story with id '" + id + "' deleted succesfully.");
  });
  return true;
};

// Export functions
exports.imageFilter = imageFilter;
exports.uploadDir = uploadDir;
exports.deleteStory = deleteStory;
exports.deleteUploaded = deleteUploaded;
exports.moveThumbnail = moveThumbnail;
exports.writeBodyFiles = writeBodyFiles;
