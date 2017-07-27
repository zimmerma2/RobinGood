var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())


router.get('/usersignup', function(req, res) {

  res.render('usersignup', {
    pageTitle: 'User signup',
    pageID: 'usersignup'
  });

});

router.post('/usersignup', function(req, res) {
  res.redirect('/');
  console.log('POST request processed for username');
  console.log('EMAIL: ' + req.body.email);
  console.log('PASS: ' + req.body.password);
 });


module.exports = router;
