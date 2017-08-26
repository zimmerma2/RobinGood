var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

var ObjectId = mongoose.Types.ObjectId;

/* GET Edit Story page. */
router.get('/story/edit/:id([a-z0-9]+)', story_edit_get);


function story_edit_get (req, res, next) {
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

      res.render('editstory.pug', {
        title : 'Edit Story',
        story : story,
        storyBody_md : data
      });
    });
  });
};

module.exports = router;
