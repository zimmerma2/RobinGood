var express = require('express');
var router = express.Router();
var Story = require('../models/story');

/* GET ProjectList page. */
router.get('/projects', function(req, res) {
    // var db = req.db;
    // var collection = db.get('projects');
    Story.find({},{},function(e,docs){
        res.render('projectlist.jade', {
            "projectlist" : docs
        });
    });
});
// router.get('/projects', function(req, res) {
//     var db = req.db;
//     var collection = db.get('projects');
//     collection.find({},{},function(e,docs){
//         res.render('projectlist', {
//             "projectlist" : docs
//         });
//     });
// });

module.exports = router;
