// app/routes.js
module.exports = function(app, passport) {
  var async = require('async');
  var crypto = require('crypto');
  var bcrypt = require('bcrypt-nodejs');
  var User = require('../models/user');
  var Token = require('../models/token');
  var nodemailer = require('nodemailer');
  var mg = require('nodemailer-mailgun-transport');

// ================================
// FORGOTTEN PASSWORD =============
// ================================
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


  // ================================
  // FORGOTTEN RESET ================
  // ================================
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


  // =====================================
  // EMAIL VERIFICATION ==================
  // =====================================
  // app.get('/confirmation/:token', function(req, res) {
  //
  //   res.render('confirmation', {
  //     pageTitle: 'confirmation',
  //     pageID: 'confirmation'
  //   });
  // });
  //
  // app.post('confirmation/:token', function (req, res) {
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


  // =====================================
  // PROFILE SECTION =====================
  // =====================================
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
  // app.use(function(req, res, next){
  //   res.status(404);
  //
  //   res.render('404.ejs', {
  //     pageTitle: '404: Not Found',
  //     pageID: '404'
  //   });
  //   return;
  // });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
  return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
