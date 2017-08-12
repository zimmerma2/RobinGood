var express = require('express');
var fs = require('fs');
var marked = require('marked');
var mongoose = require('mongoose');
var Story = require('../models/story');
var router = express.Router();

router.get('/story/:id', function(req, res, next) {
  var storyObject;
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  Story.find({'_id': {'$eq': candidateId}},{}, function(err,docs) {
    if (err) { return next(err);}
    var story = docs[0];

    // Convert story body markdown to string for rendering on the client
    const bodyPath = 'app/public/stories/' + story.body;
    fs.readFile(bodyPath, 'utf8', function (err, data) {
      if (err) { return next(err);}
      console.log("Read story body from: ", bodyPath);
      console.log("Body content:\n", data)

      res.render('story.pug', {
        title : story.title,
        story : story,
        // Markdown is rendered by the client (running marked.js)
        // Alternatively, we can generate the HTML on the server using
        // storyBody_html : marked(data)
        storyBody_md : data
      });
    });
  });
});

module.exports = router;
