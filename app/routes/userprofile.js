var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var router = express.Router();
var ObjectId = mongoose.Types.ObjectId;


router.get('/user_profile', isLoggedIn, function(req, res) {
  var candidateId = ObjectId(req.params.id);
  User.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
    console.log('Initial value of nickname: ' + user.nickname);
    res.render('user/userprofile.pug', {
      user : user
    });
  });
});

router.put('user_profile', function(req, res){
  // var candidateId = ObjectId(req.params.id);
  var candidateEmail = req.body.email;
  User.find({'email': {'$eq': candidateEmail}},{}, function(err,user) {
    user.nickname = req.body.nickname;
    console.log('Updated value of email: ' + user.email);
    user.save(function (err) {
      if (err) {
        console.log('error: ' + err);
        // return res.status(500).send({ msg: err.message });
      }
      // res.status(200).send("The account has been verified. Please log in.");
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
