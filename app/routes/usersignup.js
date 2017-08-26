module.exports = function(app, passport) {
  // =====================================
  // USER SIGNUP =========================
  // =====================================
  // show the signup form
  app.get('/usersignup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('user/usersignup.pug', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/usersignup', passport.authenticate('user-local-signup', {
    successRedirect : '/userlogin', // redirect to the secure profile section
    failureRedirect : '/usersignup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
};
