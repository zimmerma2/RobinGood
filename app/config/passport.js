// code taken from https://scotch.io/tutorials/easy-node-authentication-setup-and-local

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');
var Sponsor         = require('../models/sponsor');
var Token           = require('../models/token');

var crypto = require('crypto');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var bcrypt          = require('bcrypt-nodejs');
// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    console.log('User ID is: ' + user.id);
    console.log('User EMAIL is: ' + user.email);
    done(null, user.id);
  });

  // used to serialize the sponsor for the session
  // passport.serializeUser(function(sponsor, done) {
  //   done(null, sponsor.id);
  // });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // used to deserialize the sponsor
  // passport.deserializeUser(function(id, done) {
  //   Sponsor.findById(id, function(err, sponsor) {
  //     done(err, sponsor);
  //   });
  // });

  // =========================================================================
  // LOCAL USER SIGNUP =======================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('user-local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, email, password, done) {
    // asynch
    // User.findOne will not fire unless data is sent back
    process.nextTick(function() {
      User.findOne({'email' : email}, function (err, user) {
        if(err) {
          return done(err);
        }
        // if 'user' exists
        if(user) {
          // if 'user' has already been verified, reject the signup request
          if(user.isVerified) {
            console.log('That email is already taken');
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }
          // if 'user' has not been verified (registered but has not verified email), resend token
          else {
            var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            user.verification_token = token._id;

            user.save(function(err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              // Create a verification token for this user
              // Save the verification token
              token.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }

                // Send the email
                var auth = {
                  auth: {
                    api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
                    domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
                  }
                }
                var nodemailerMailgun = nodemailer.createTransport(mg(auth));
                var mailOptions = {
                  from: 'no-reply@yourwebapplication.com',
                  to: user.email,
                  subject: 'Account Verification Token',
                  text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user_verification\/' + token.token + '.\n' };
                  nodemailerMailgun.sendMail(mailOptions, function (err) {
                    if (err) {
                      console.log('Error: ' + err);
                    }
                    // res.status(200).send('A verification email has been sent to ' + user.email + '.');
                  });
                });
              });
            }
          }
          // if 'user' does not exists, create it and send an email verification token
          else {
            // checks for password and repeat_password match
            if (password != req.body.repeat_password) {
              console.log('Passwords do not match.');
              return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
            }

            // TODO: add more sanitization and validation
            req.checkBody('email','Email is required.').notEmpty().isEmail();

            var newUser = new User();
            newUser.email = email;
            newUser.password = newUser.generateHash(password);

            var errors = req.validationErrors();
            if(errors) {
              // TODO: add page reload + error message pop-up
              console.log('There are errors.');
            }
            else {
              var token = new Token({ _userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });
              newUser.verification_token = token._id;

              newUser.save(function(err) {
                if (err) { return res.status(500).send({ msg: err.message }); }

                // Create a verification token for this user
                // Save the verification token
                token.save(function (err) {
                  if (err) { return res.status(500).send({ msg: err.message }); }

                  // Send the email
                  var auth = {
                    auth: {
                      api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
                      domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
                    }
                  }
                  var nodemailerMailgun = nodemailer.createTransport(mg(auth));
                  var mailOptions = {
                    from: 'no-reply@yourwebapplication.com',
                    to: newUser.email,
                    subject: 'Account Verification Token',
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user_verification\/' + token.token + '.\n' };
                    nodemailerMailgun.sendMail(mailOptions, function (err) {
                      if (err) {
                        console.log('Error: ' + err);
                      }
                      // res.status(200).send('A verification email has been sent to ' + newUser.email + '.');
                    });
                  });
                });
              }
            }
          });
        });
      }));

      // =========================================================================
      // LOCAL SPONSOR SIGNUP ====================================================
      // =========================================================================
      // we are using named strategies since we have one for login and one for signup
      // by default, if there was no name, it would just be called 'local'

      passport.use('sponsor-local-signup', new LocalStrategy({
        usernameField : 'representative_email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function (req, representative_email, password, done) {
        //asynch
        process.nextTick(function() {
          Sponsor.findOne({'representative_email' : representative_email}, function (err, sponsor) {
            if(err){
              console.log('Error: ' + err);
              return done(err);
            }
            // if 'sponsor' already exists, check if the email of the sponsor has been verified.
            if(sponsor) {
              // if email of 'sponsor' has been verified, reject the signup request
              if(sponsor.isVerified) {
                console.log('A company with that name already exists.');
                return done(null, false, req.flash('signupMessage', 'A company with that name already exists.'));
              }
              else {
                var token = new Token({ _userId: sponsor._id, token: crypto.randomBytes(16).toString('hex') });
                sponsor.verification_token = token._id;

                sponsor.save(function(err) {
                  if (err) { console.log('Error: ' + err);
                    // return res.status(500).send({ msg: err.message });
                  }
                  // Create a verification token for this sponsor
                  // Save the verification token
                  token.save(function (err) {
                    if (err) { console.log('Error: ' + err);
                      // return res.status(500).send({ msg: err.message });
                     }

                    // Send the email
                    var auth = {
                      auth: {
                        api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
                        domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
                      }
                    }
                    var nodemailerMailgun = nodemailer.createTransport(mg(auth));
                    var mailOptions = {
                      from: 'no-reply@yourwebapplication.com',
                      to: sponsor.representative_email,
                      subject: 'Account Verification Token',
                      text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/sponsor_verification\/' + token.token + '.\n' };
                      nodemailerMailgun.sendMail(mailOptions, function (err) {
                        if (err) {
                          console.log('Error: ' + err);
                        }
                        // res.status(200).send('A verification email has been sent to ' + sponsor.email + '.');
                      });
                    });
                  });
                }

            } else {
              // checks for password and repeat_password match
              if (password != req.body.repeat_password) {
                console.log('Passwords do not match.');
                return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
              }

              // UNCOMMENT later when views are good/usable
              // req.checkBody('copmany_name','Company Name is required').notEmpty();
              // req.checkBody('copmany_id','Company ID is required.').notEmpty();
              // req.checkBody('representative_first_name','Representative first must be specified.').notEmpty();
              // req.checkBody('representative_last_name','Representative last is required.').notEmpty();
              // req.checkBody('representative_email','Representative email is required.').notEmpty();
              // req.checkBody('password','Password is required.').notEmpty();

              var newSponsor = new Sponsor();
              newSponsor.representative_email = representative_email;
              newSponsor.company_name = req.body.company_name;
              newSponsor.company_id = req.body.company_id;
              newSponsor.representative_first_name = req.body.representative_first_name;
              newSponsor.representative_last_name = req.body.representative_first_name;

              newSponsor.password = newSponsor.generateHash(password);

              var errors = req.validationErrors();
              if(errors) {
                // TODO: add page reload + error message pop-up
                console.log('There are errors.');
              }
              else {
                var token = new Token({ _userId: newSponsor._id, token: crypto.randomBytes(16).toString('hex') });
                newSponsor.verification_token = token._id;

                newSponsor.save(function(err) {
                  if (err) { return res.status(500).send({ msg: err.message }); }

                  // Create a verification token for this user
                  // Save the verification token
                  token.save(function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }

                    // Send the email
                    var auth = {
                      auth: {
                        api_key : 'key-cdff84af4df2afedfcbfae910a42c471',
                        domain: 'sandbox9027eeecb61d473c9a14f12a8e4a846e.mailgun.org'
                      }
                    }
                    var nodemailerMailgun = nodemailer.createTransport(mg(auth));
                    var mailOptions = {
                      from: 'no-reply@yourwebapplication.com',
                      to: newSponsor.representative_email,
                      subject: 'Account Verification Token',
                      text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/sponsor_verification\/' + token.token + '.\n' };
                      nodemailerMailgun.sendMail(mailOptions, function (err) {
                        if (err) {
                          console.log('Error: ' + err);
                        }
                        // res.status(200).send('A verification email has been sent to ' + newSponsor.email + '.');
                      });
                    });
                  });
                }
              }
            });
          });
        }));

        // =========================================================================
        // LOCAL USER LOGIN ========================================================
        // =========================================================================
        // we are using named strategies since we have one for login and one for signup
        // by default, if there was no name, it would just be called 'local'

        passport.use('user-local-login', new LocalStrategy({
          // by default, local strategy uses username and password, we will override with email
          usernameField : 'email',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to login already exists
          User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
            return done(err);

            // if no user is found, return the message
            if (!user) {
              console.log('No user found.');
              return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
              console.log('Oops! Wrong password.');
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }

            if (!user.isVerified) {
              console.log ('User is not verified. Please verify your email.');
              return done(null, false, req.flash('loginMEssage', 'User is not verified.'));
            }
            // all is well, return successful user
            req.session.authenticated = true;
            req.logIn(user, function(err) {
                 if (err) { return done(err); }
                 // Redirect if it succeeds
                 console.log('Login successful.');
               });

            return done(null, user);
          });
        }));


        // =========================================================================
        // LOCAL SPONSOR LOGIN =====================================================
        // =========================================================================
        // we are using named strategies since we have one for login and one for signup
        // by default, if there was no name, it would just be called 'local'

        passport.use('sponsor-local-login', new LocalStrategy({
          // by default, local strategy uses username and password, we will override with email
          usernameField : 'representative_email',
          passwordField : 'password',
          passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, representative_email, password, done) { // callback with email and password from our form
          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to login already exists
          console.log('It gets here.');
          Sponsor.findOne({ 'representative_email' :  representative_email }, function(err, sponsor) {
            // if there are any errors, return the error before anything else
            if (err) {
              console.log('There has been an error ' + err);
              return done(err);
            }
            // if no sponsor is found, return the message
            if (!sponsor) {
              console.log('No sponsor found.');
              return done(null, false, req.flash('loginMessage', 'No sponsor found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the sponsor is found but the password is wrong
            if (!sponsor.validPassword(password)) {
              console.log('Oops! Wrong password.');
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
            if (!sponsor.isVerified) {
              console.log ('User is not verified. Please verify your email.');
              return done(null, false, req.flash('loginMEssage', 'User is not verified.'));
            }
            // all is well, return successful sponsor
            console.log('Login successful.');
            return done(null, sponsor);
          });
        }));
      };
