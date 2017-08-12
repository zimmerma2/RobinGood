var express = require('express');
var Story = require('../models/story');
var router = express.Router();

/* GET StoryList page. */
router.get('/stories', function(req, res) {
    Story.find({},{},function(e,docs){
        res.render('storylist.pug', {
            "storylist" : docs
        });
    });
});


module.exports = router;
