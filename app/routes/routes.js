// app/routes.js
module.exports = function(app, passport) {
  var async = require('async');
  var crypto = require('crypto');
  var bcrypt = require('bcrypt-nodejs');
  var User = require('../models/user');
  var nodemailer = require('nodemailer');
  var mg = require('nodemailer-mailgun-transport');
  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  // app.get('/', function(req, res) {
  //     res.render('index.ejs'); // load the index.ejs file
  // });

  // =====================================
  // USER LOGIN ==========================
  // =====================================
  // show the login form
  // app.get('/userlogin', function(req, res) {
  //
  //   // render the page and pass in any flash data if it exists
  //   res.render('userlogin.ejs', { message: req.flash('loginMessage') });
  // });
  //
  // // process the login form
  // app.post('/userlogin', passport.authenticate('user-local-login', {
  //   successRedirect : '/', // redirect to the secure profile section
  //   failureRedirect : '/userlogin', // redirect back to the signup page if there is an error
  //   failureFlash : true // allow flash messages
  // }));


  // =====================================
  // SPONSOR LOGIN =======================
  // =====================================
  // show the login form
  // app.get('/sponsorlogin', function(req, res) {
  //
  //   // render the page and pass in any flash data if it exists
  //   res.render('sponsorlogin.ejs', { message: req.flash('loginMessage') });
  // });
  //
  // // process the login form
  // app.post('/sponsorlogin', passport.authenticate('sponsor-local-login', {
  //   successRedirect : '/', // redirect to the secure profile section
  //   failureRedirect : '/sponsorlogin', // redirect back to the signup page if there is an error
  //   failureFlash : true // allow flash messages
  // }));


  // =====================================
  // USER SIGNUP =========================
  // =====================================
  // show the signup form
  // app.get('/usersignup', function(req, res) {
  //
  //   // render the page and pass in any flash data if it exists
  //   res.render('usersignup.ejs', { message: req.flash('signupMessage') });
  // });
  //
  // // process the signup form
  // app.post('/usersignup', passport.authenticate('user-local-signup', {
  //   successRedirect : '/login', // redirect to the secure profile section
  //   failureRedirect : '/usersignup', // redirect back to the signup page if there is an error
  //   failureFlash : true // allow flash messages
  // }));

  // =====================================
  // SPONSOR SIGNUP ======================
  // =====================================
  // show the signup form
  // app.get('/sponsorsignup', function(req, res) {
  //
  //   // render the page and pass in any flash data if it exists
  //   res.render('sponsorsignup.ejs', { message: req.flash('signupMessage') });
  // });
  //
  // // process the signup form
  // app.post('/sponsorsignup', passport.authenticate('sponsor-local-signup', {
  //   successRedirect : '/login', // redirect to the secure profile section
  //   failureRedirect : '/sponsorsignup', // redirect back to the signup page if there is an error
  //   failureFlash : true // allow flash messages
  // }));
  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/forgot', function(req, res){
    res.render('forgot.pug', {
      user: req.user
    });
  });

  app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            console.log('No account with that email address exists.');
            return res.redirect('/forgot');
          }

          console.log('User found. Token is being created and pass reset email is being sent.');
          console.log('Token created = ' + token);

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          console.log('Token saved = ' + user.resetPasswordToken);
          console.log('Token expires at = ' + user.resetPasswordExpires);
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var auth = {
          auth: {
            api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
            domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
          }
        }
        var nodemailerMailgun = nodemailer.createTransport(mg(auth));

        nodemailerMailgun.sendMail({
          from: 'passwordreset@demo.com',
          to: user.email,
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        }, function (err, info) {
          if (err) {
            console.log('Error: ' + err);
          }
          else {
            console.log('Response: ' + info);
            req.flash('info', 'An e-mail has been sent to ' + user.mail + ' with further instructions.');
          }
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()} }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        console.log('Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset.pug', {
        user: req.user
      });
    });
  });

  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            console.log('Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          if (!req.body.password == req.body.repeat_password) {
            req.flash('error', 'Passwords do not match.');
            console.log('Passwords do not match.');
            return res.redirect('back');
        }

          user.password = user.generateHash(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      }, function(user, done) {

        var auth = {
          auth: {
            api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
            domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
          }
        }
        var nodemailerMailgun = nodemailer.createTransport(mg(auth));

        nodemailerMailgun.sendMail({
          from: 'passwordreset@demo.com',
          to: user.email,
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        }, function (err, info) {
          if (err) {
            console.log('Error: ' + err);
          }
          else {
            console.log('Response: ' + info);
            req.flash('info', 'An e-mail has been sent to ' + user.mail + ' with further instructions.');
          }
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });


  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // =====================================
  // 404 Not Found =======================
  // =====================================
  app.use(function(req, res, next){
    res.status(404);

    res.render('404.ejs', {
      pageTitle: '404: Not Found',
      pageID: '404'
    });
    return;
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
