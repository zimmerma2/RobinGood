var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

// router.get('/userlogin', function(req, res) {
//
//   res.render('userlogin', {
//     pageTitle: 'Login',
//     pageID: 'userlogin'
//   });
//
// });
//
//
// router.post('/userlogin', function(req, res) {
//   res.redirect('/');
//   console.log('POST request processed for username');
//   console.log('EMAIL: ' + req.body.email);
//   console.log('PASS: ' + req.body.password);
//  });

module.exports = router;
