module.exports = function(app, passport) {
  // =====================================
  // USER SIGNUP =========================
  // =====================================
  // show the signup form
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());

  app.get('/usersignup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('user/usersignup.pug', { message: req.flash('signupMessage') });
  });

  // app.post('/usersignup', function(req, res, next) {
  //     console.log(req.url);
  //     passport.authenticate('user-local-login', function(err, user, info) {
  //         console.log("authenticate");
  //         console.log(err);
  //         console.log(user);
  //         console.log(info);
  //     })(req, res, next);
  // });

// process the signup form
  app.post('/usersignup', passport.authenticate('user-local-signup', {
    successRedirect : '/userlogin', // redirect to the secure profile section
    failureRedirect : '/usersignup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
};
