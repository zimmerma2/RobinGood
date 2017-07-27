var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/sponsorsignup', function(req, res) {

  res.render('sponsorsignup', {
    pageTitle: 'Sponsor signup',
    pageID: 'sponsorsignup'
  });

});

router.post('/sponsorsignup', function(req, res) {
  res.redirect('/');
  console.log('POST request processed for username');
  console.log('COMPANY: ' + req.body.company_name);
  console.log('REPRESENTATIVE_NAME: ' + req.body.rep_name);
  console.log('REPRESENTATIVE_EMAIL: ' + req.body.rep_email);
  console.log('REPRESENTATIVE_NUMBER: ' + req.body.rep_number);
 });

module.exports = router;
