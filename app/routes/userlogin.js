// var express = require('express');
// var router = express.Router();
// var bodyParser = require('body-parser')
//
// router.use(bodyParser.urlencoded({ extended: false }))
// router.use(bodyParser.json())
//
// router.get('/userlogin', function(req, res) {
//
//   // render the page and pass in any flash data if it exists
//   res.render('userlogin.ejs', { message: req.flash('loginMessage') });
// });
//
// // process the login form
// router.post('/userlogin', passport.authenticate('user-local-login', {
//   successRedirect : '/', // redirect to the secure profile section
//   failureRedirect : '/userlogin', // redirect back to the signup page if there is an error
//   failureFlash : true // allow flash messages
// }));
//
// module.exports = router;
module.exports = function(app, passport) {
  // =====================================
  // USER LOGIN  =========================
  // =====================================
  // show the signup form
  app.get('/userlogin', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('userlogin.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/userlogin', passport.authenticate('user-local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/userlogin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
};
