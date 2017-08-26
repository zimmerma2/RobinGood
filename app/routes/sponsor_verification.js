var express = require('express');
var router = express.Router();
var Token = require('../models/token');
var Sponsor = require('../models/sponsor');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get('/sponsor_verification/:token', function(req, res) {
  var token = req.params.token;
  Token.findOne({ token: token}, function(err, tokenObject){
    if(!tokenObject) console.log('no such token exists');
    else{
      var sponsor_id = tokenObject._userId;
      console.log('Sponsor ID:' + sponsor_id);
      Sponsor.findOne({ _id: sponsor_id }, function (err, sponsor) {
        if (!sponsor) {
          console.log('Unable to find a sponsor for this token.');
          // return res.status(400).send({ msg: 'We were unable to find a sponsor for this token.' });
        }
        else if (sponsor.isVerified) {
          console.log('This sponsor has already been verified.');
          // return res.status(400).send({ type: 'already-verified', msg: 'This sponsor has already been verified.' });
        }
        else {
          console.log('Sponsor is found');
          tokenObject.remove();
          // sponsor.verification_token = 0; // set the token to 0 after email has been verified and token has been deleted
          sponsor.isVerified = true;
          console.log('Sponsor with email ' + sponsor.email + 'has been successfully verified: ' + sponsor.isVerified);
          sponsor.save(function (err) {
            if (err) {
              console.log('error: ' + err);
              // return res.status(500).send({ msg: err.message });
            }
            // res.status(200).send("The account has been verified. Please log in.");
          });
        }
      });
    }
  });
  res.render('sponsor/sponsor_verification', {
    pageTitle: 'SponsorVerification',
    pageID: 'sponsor_verification'
  });
});

module.exports = router;
