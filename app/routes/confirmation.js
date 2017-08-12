var express = require('express');
var router = express.Router();
var Token = require('../models/token');
var User = require('../models/user');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get('/confirmation/:token', function(req, res) {
  var token = req.params.token;
  Token.findOne({ token: token}, function(err, tokenObject){
    if(!tokenObject) console.log('no such token exists');
    else{
      var user_id = tokenObject._userId;
      console.log('User ID:' + user_id);
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
          console.log('User with email ' + user.email + 'has been successfully verified: ' + user.isVerified);
          user.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
            // res.status(200).send("The account has been verified. Please log in.");
          });
        }
      });
    }
  });
  res.render('confirmation', {
    pageTitle: 'confirmation',
    pageID: 'confirmation'
  });
});

module.exports = router;
