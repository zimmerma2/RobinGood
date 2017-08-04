// code taken from https://scotch.io/tutorials/easy-node-authentication-setup-and-local

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');
var Sponsor         = require('../models/sponsor');

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
    done(null, user.id);
  });

  // used to serialize the sponsor for the session
  passport.serializeUser(function(sponsor, done) {
    done(null, sponsor.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // used to deserialize the sponsor
  passport.deserializeUser(function(id, done) {
    Sponsor.findById(id, function(err, sponsor) {
      done(err, sponsor);
    });
  });

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
        if(err)
        return done(err);
        if(user) {
          console.log('That email is already taken');
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
          // checks for password and repeat_password match
          if (password != req.body.repeat_password) {
            console.log('Passwords do not match.');
            return done(null, false, req.flash('signupMessage', 'Passwords do not match.'));
          }

          var newUser = new User();
          newUser.email = email;
          newUser.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if(err)
            throw err;
            return done(null, newUser);
          });
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
    usernameField : 'company_name',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, company_name, password, done) {
    //asynch
    process.nextTick(function() {
      Sponsor.findOne({'company_name' : company_name}, function (err, sponsor) {
        if(err){
          console.log('Error: ' + err);
          return done(err);
        }
        if(sponsor) {
          console.log('A company with that name already exists.');
          return done(null, false, req.flash('signupMessage', 'A company with that name already exists.'));
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
          newSponsor.company_name = company_name;
          newSponsor.company_id = req.body.company_id;
          newSponsor.representative_first_name = req.body.rep_first_name;
          newSponsor.representative_last_name = req.body.rep_last_name;
          newSponsor.representative_email = req.body.rep_email;

          newSponsor.password = newSponsor.generateHash(password);

          newSponsor.save(function(err) {
            if(err)
            throw err;
            return done(null, newSponsor);
          });
          console.log('New sponsor was created: ' + company_name);
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
      // all is well, return successful user
      console.log('Login successful.');
      return done(null, user);
    });
  }));
};
