var express = require('express');
var mongoose = require('mongoose');
var Sponsor = require('../models/sponsor');
var router = express.Router();

// router.get('/sponsor_profile/:id', function(req, res) {
//   var candidateId = req.params.id;
//   Sponsor.find({'_id': {'$eq': candidateId}},{},function(e,docs){
//       res.render('sponsor/sponsorprofile', {
//         pageTitle: 'SPONSOR_PROFILE',
//         pageID: 'sponsorprofile'
//       });
//   });
// });

router.get('/sponsor_profile', isLoggedIn, function(req, res) {
  // var candidateId = ObjectId(req.params.id);
  var candidateEmail = req.body.email;
  console.log("Log in email is: " + candidateEmail);
  Sponsor.find({'_id': {'$eq': candidateId}},{}, function(err,sponsor) {
    res.render('sponsor/sponsorprofile.pug', {
      sponsor : sponsor
    });
  });
});

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    console.log('successful authentication again.');
    return next();
  }
  console.log('FUCKED UP.');
  // if they aren't redirect them to the home page
  res.redirect('/');
}

module.exports = router;
