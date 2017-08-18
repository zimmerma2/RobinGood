var express = require('express');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

var ObjectId = mongoose.Types.ObjectId;

/* GET Story page. */
router.get('/story/:id([a-z0-9]+)', function(req, res, next) {
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
});

module.exports = router;
