var express = require('express');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

router.get('/story/:id', function(req, res) {
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  Story.find({'_id': {'$eq': candidateId}},{},function(e,docs){
      res.render('story.jade', {
          "story" : docs[0]
      });
  });

});

module.exports = router;
