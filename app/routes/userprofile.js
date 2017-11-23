var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var router = express.Router();
var ObjectId = mongoose.Types.ObjectId;

// Load local modules
var authHelpers = require('../lib/authHelpers');
var isLoggedIn = authHelpers.isLoggedIn;

router.get('/user_profile', isLoggedIn, function(req, res) {
  var candidateId = ObjectId(req.params.id);
  User.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
    console.log('Initial value of nickname: ' + user.nickname);
    res.render('user/userprofile.pug', {
      user : user
    });
  });
});

router.post('user_profile', function(req, res, done){
  // var candidateId = ObjectId(req.params.id);
  var candidateEmail = req.body.email;
  User.findOne({'email': {'$eq': candidateEmail}},{}, function(err,user) {
    user.nickname = req.body.nickname;
    user.date_of_birth = req.body.date_of_birth;
    user.address = req.body.address;
    user.nationality = req.body.nationality;
    user.phone_number = req.body.phone_number;

    console.log('Updated value of nickname: ' + user.nickname);
    user.save(function (err) {
      if (err) {
        console.log('error: ' + err);
        // return res.status(500).send({ msg: err.message });
      }
      // res.status(200).send("The account has been verified. Please log in.");
    });
    return res.status(200);
  });
});

module.exports = router;
