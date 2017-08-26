var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var router = express.Router();

router.get('/user_profile/', function(req, res) {
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  User.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
    console.log('Initial value of nickname: ' + user.nickname);
    res.render('user/userprofile.pug', {
      title : user.email,
      user : user,
    });
  });
});

router.put('user_profile/', function(req, res){
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  User.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
    user.nickname = req.body.nickname;
    console.log('Updated value of nickname: ' + user.nickname);
    user.save(function (err) {
      if (err) {
        console.log('error: ' + err);
        // return res.status(500).send({ msg: err.message });
      }
      // res.status(200).send("The account has been verified. Please log in.");
    });
  });
});

module.exports = router;
