var express = require('express');
var router = express.Router();
var Story = require('../models/story');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

/* GET New Project page. */
router.get('/newproject', function(req, res) {
  res.render('newproject.jade', { title: 'Create a New Project' });
});


/* POST to Add Project Service */
router.post('/addproject', function(req, res) {

  // Set our internal DB variable
  // var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var projectName = req.body.projectName;
  var projectDescription = req.body.projectDescription;
  var fundGoal = req.body.fundGoal;
  var endDate = req.body.endDate;

  // Set our collection
  // var collection = db.get('projects');

  // Get current date
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();


  var newStory = new Story();
  newStory.title = projectName;
  newStory.description = projectDescription;
  newStory.target_donation = fundGoal;
  newStory.closing_date = endDate;

  newStory.save(function(err) {
    if(err)
    throw err;
    return done(null, newStory);
  });

  // Submit to the DB
  // Story.insert({
  //     "name" : projectName,
  //     "description" : projectDescription,
  //     "start_date" : date,
  //     "end_date" : endDate,
  //     "fund_goal" : fundGoal,
  //     "raised" : 0,
  //     "sponsors" : [],
  //     "thumbnail" : '' //TODO add logic for file upload
  // }, function (err, doc) {
  //     if (err) {
  //         // If it failed, return error
  //         res.send("There was a problem adding the information to the database.");
  //     }
  //     else {
  //         // And forward to success page
  //         res.redirect("projects");
  //     }
  // });
});

module.exports = router;
