var express = require('express');
var router = express.Router();
var Token = require('../models/token');
var User = require('../models/user');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get('/confirmation/:token', function(req, res) {
  var token = req.body.token;
  console.log('Token = ' + token);
  res.render('confirmation', {
    pageTitle: 'confirmation',
    pageID: 'confirmation'
  });

});

router.put('/confirmation/:token', function(req, res){
  var token = req.token;
  var user_id = token._userId;
  console.log('Put request.');
  User.findOne({ _id: user_id }, function (err, user) {
    if (!user) {
      console.log('Unable to find a user for this token.');
      // return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
    }
    else if (user.isVerified) {
      console.log('This user has already been verified.');
      // return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
    }
    else {
      console.log('User is found');
      user.isVerified = true;
    }
  });
});

  // router.put('confirmation/:token', function (req, res) {
  //   console.log('ARGHHHHHHHHH');
  //   // Check for validation errors
  //   var errors = req.validationErrors();
  //   if (errors) return res.status(400).send(errors);
  //
  //   // Find a matching token
  //   Token.findOne({ token: req.body.token }, function (err, token) {
  //     if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
  //
  //     // If we found a token, find a matching user
  //     User.findOne({ _id: token._userId }, function (err, user) {
  //       if (!user) {
  //         console.log('Unable to find a user for this token.');
  //         return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
  //       }
  //       if (user.isVerified) {
  //         console.log('This user has already been verified.');
  //         return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
  //       }
  //       // Verify and save the user
  //       user.isVerified = true;
  //       console.log('User with email ' + user.email + 'has been successfully verified: ' + user.isVerified);
  //       user.save(function (err) {
  //         if (err) { return res.status(500).send({ msg: err.message }); }
  //         res.status(200).send("The account has been verified. Please log in.");
  //       });
  //     });
  //   });
  // });

  module.exports = router;
