var express = require('express');
var Story = require('../models/story');
var router = express.Router();

/* GET StoryList page. */
router.get('/stories', function(req, res) {
    // var db = req.db;
    // var collection = db.get('stories');
    Story.find({},{},function(e,docs){
        res.render('storylist.jade', {
            "storylist" : docs
        });
    });
});
// router.get('/stories', function(req, res) {
//     var db = req.db;
//     var collection = db.get('stories');
//     collection.find({},{},function(e,docs){
//         res.render('storylist', {
//             "storylist" : docs
//         });
//     });
// });

module.exports = router;
