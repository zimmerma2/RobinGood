var express = require('express');
var Story = require('../models/story');
var router = express.Router();

/* GET Stories page. */
router.get('/stories', function(req, res, next) {
    // Sort by title, descending
    Story.find().sort({title : 1}).exec(function(err,stories) {
        if (err) {return next(err);}
        res.render('storylist.pug', {
            "storylist" : stories
        });
    });
});

module.exports = router;
