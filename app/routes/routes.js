// app/routes.js
module.exports = function(app, passport) {
  var async = require('async');
  var crypto = require('crypto');
  var bcrypt = require('bcrypt-nodejs');
  var User = require('../models/user');
  var Token = require('../models/token');
  var nodemailer = require('nodemailer');
  var mg = require('nodemailer-mailgun-transport');
  var mongoose = require('mongoose');
  var ObjectId = mongoose.Types.ObjectId;

  // =====================================
  // USER SIGNUP  ========================
  // =====================================
  app.get('/usersignup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('user/usersignup.pug', { message: req.flash('signupMessage') });
  });

// process the signup form
  app.post('/usersignup', passport.authenticate('user-local-signup', {
    successRedirect : '/verification_sent', // redirect to the secure profile section
    failureRedirect : '/usersignup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));


  // =====================================
  // USER LOGIN  =========================
  // =====================================
  // show the signup form
  app.get('/userlogin', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('user/userlogin.pug', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/userlogin', passport.authenticate('user-local-login', {
    successRedirect : '/user_profile', // redirect to the secure profile section
    failureRedirect : '/userlogin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }),
  function(req,res) {
    console.log('The user that just logged in is ' + req.user);
    req.session.user = req.user;
  });

  // =====================================
  // SPONSOR SIGNUP  =====================
  // =====================================

  app.get('/sponsorsignup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('sponsor/sponsorsignup.pug', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/sponsorsignup', passport.authenticate('sponsor-local-signup', {
    successRedirect : '/sponsorlogin', // redirect to the secure profile section
    failureRedirect : '/sponsorsignup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));


  // =====================================
  // SPONSOR LOGIN  ======================
  // =====================================

  app.get('/sponsorlogin', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('sponsor/sponsorlogin.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/sponsorlogin', passport.authenticate('sponsor-local-login', {
    successRedirect : '/sponsor_profile', // redirect to the secure profile section
    failureRedirect : '/sponsorlogin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));


  // =====================================
  // USER PROFILE  =======================
  // =====================================

  // app.get('/user_profile', isLoggedIn, function(request, response) {
  //   var candidateId = ObjectId(request.params.id);
  //   User.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
  //     console.log('Initial value of email: ' + request.user.email);
  //     response.render('user/userprofile.pug', {
  //       user : request.user
  //     });
  //   });
  // });

  app.get('/user_profile', isLoggedIn, function(request, response) {
    console.log('Session ID in GET is' + request.sessionID);
    response.render('user/userprofile.pug', {
      user : request.user
    });
  });

  app.post('/user_profile', function(req, res){
    console.log('Session ID in POST is' + req.sessionID);
    User.update({_id: req.user.id}, {
        nickname: req.body.nickname
    },function(err, numberAffected, rawResponse) {
      if(err)
       console.log('new profile update error');
    });
  });


  // app.post('/user_profile', function(req, res){
  //   var email = req.user.email;
  //   console.log('email is = ' + email);
  //   User.findOne({'email' : email}, function (err, updatedUser) {
  //     console.log('updated updatedUser email is = ' + updatedUser.email);
  //     if(!updatedUser) {console.log('ERrOR ' + err);}
  //     else {
  //       updatedUser.nickname = req.body.nickname;
  //       updatedUser.save(function(err) {
  //         if(err){console.log('Error again ' + err);}
  //         else{console.log('Success');}
  //       });
  //       res.redirect('back');
  //     }
  //   });
  // });

  // =====================================
  // SPONSOR PROFILE  ====================
  // =====================================

  app.get('/sponsor_profile', isLoggedIn, function(req, res) {
    var candidateId = ObjectId(req.params.id);
    console.log("SPONSOR ID IS " + candidateId);
    Sponsor.find({'_id': {'$eq': candidateId}},{}, function(err,user) {
      console.log('Initial value of email: ' + req.sponsor.representative_email);
      res.render('sponsor/sponsorprofile.ejs', {
        sponsor : req.sponsor
      });
    });
  });

  app.post('/sponsor_profile', function(req, res){
    var email = req.sponsor.representative_email;
    console.log('email is = ' + email);
    Sponsor.findOne({'email' : email}, function (err, updatedSponsor) {
      console.log('updated updatedSponsor email is = ' + updatedSponsor.email);
      if(!updatedSponsor) {console.log('ERrOR ' + err);}
      else {
        updatedSponsor.representative_first_name = req.body.representative_first_name;
        updatedSponsor.save(function(err) {
          if(err){console.log('Error again ' + err);}
          else{console.log('Success');}
        });
        res.redirect('back');
      }
    });
  });

  // ================================
  // FORGOTTEN PASSWORD =============
  // ================================
  app.get('/forgot', function(req, res){
    res.render('passReset/resetRequest.pug', {
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
      res.redirect('/');
    });
  });

  app.get('/reset_email_sent', function(req, res){
    res.render('passReset/resetEmailSent.pug', {
      user: req.user
    });
  });

  // ================================
  // FORGOTTEN RESET ================
  // ================================
  app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token}, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        console.log('Password reset token is invalid or has expired = ' + req.params.token);
        return res.redirect('/forgot');
      }
      console.log(user.resetPasswordToken);
      res.render('passReset/newPassword.pug', {
        user: user
      });
    });
  });

  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token}, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            console.log('Password reset token is invalid or has expired. = ' + req.params.token);
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
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    delete req.session.authenticated;
    console.log('Successfully logged out');
    req.session.destroy( function ( err ) {
      console.log('Successfully logged out.');
      res.redirect('/');
    });
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    console.log('isAuthenticated was successful.');
    return next();
  }
  console.log('isAuthenticated failed again.');
  // if they aren't redirect them to the home page
  res.redirect('/');
}
