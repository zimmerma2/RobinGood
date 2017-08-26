var fs = require('fs');
var marked = require('marked');
var Story = require('../models/story');

const uploadDir = 'app/public/'

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

function deleteStory(id) {
  Story.findById(id, function deleteStoryFiles(err, story) {
    if (err) throw err;
    // If no story found, continue request
    if (story === null) {
      console.error("No story with the the _id '" + id + "' exists.");
      return false;
    }

    deleteUploaded(uploadDir + 'thumbnails/' + story.thumbnail);
    deleteUploaded(uploadDir + 'markdown/' + story.body_md);
    deleteUploaded(uploadDir + 'html/' + story.body_html);
  });

  Story.findByIdAndRemove(id, function (err) {
    if (err) throw err;
    //Success - got to author list
    console.log("Story with id '" + id + "' deleted succesfully.");
  });
};

function writeStoryFiles(newStory, req, res, next) {
  // Created story, save related files
  var thumbPath = uploadDir + 'thumbnails/' + newStory.thumbnail;
  var bodyPath_md = uploadDir + 'stories/markdown/' + newStory.body_md;
  var bodyPath_html = uploadDir + 'stories/html/' + newStory.body_html;

  // Move thumbnail
  fs.rename(req.file.path, thumbPath, function(err) {
    if (err) {return next(err)};
    console.log("\nStory created!\nID: ",newStory._id);
    console.log("Moved thumbnail to: ", thumbPath);
  });

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

// Export functions
exports.deleteUploaded = deleteUploaded;
exports.writeStoryFiles = writeStoryFiles;
exports.deleteStory = deleteStory;
