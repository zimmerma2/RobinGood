var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

// Local modules
var storyHelpers = require('../lib/storyHelpers');

var ObjectId = mongoose.Types.ObjectId;

/* GET Edit Story page. */
router.get('/story/:id([a-z0-9]+)/edit', story_edit_get);

/* POST to Edit Story page. */
router.post('/story/:id([a-z0-9]+)/edit', story_edit_post);

/* POST to Delete Story */
router.post('/story/:id([a-z0-9]+)/delete', story_edit_delete);


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

function story_edit_post (req, res, next) {

}

function story_edit_delete (req, res, next) {
  // Sanitize id
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Redirect to 404 if id is invalid
  if (!ObjectId.isValid(req.params.id)) {
    return next();
  }

  storyHelpers.deleteStory(req.params.id);

  res.redirect('/stories');
}

module.exports = router;
