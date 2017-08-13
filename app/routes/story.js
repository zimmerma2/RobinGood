var express = require('express');
var fs = require('fs');
var marked = require('marked');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

router.get('/story/:id', function(req, res, next) {
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  Story.find({'_id': {'$eq': candidateId}},{}, function(err,docs) {
    if (err) { return next(err);}
    var story = docs[0];

    res.render('story.pug', {
      title : story.title,
      story : story,
    });
  });
});

module.exports = router;
