module.exports = function(app, passport) {
  // =====================================
  // USER SIGNUP =========================
  // =====================================
  // show the signup form
  app.get('/sponsorsignup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('sponsorsignup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/sponsorsignup', passport.authenticate('sponsor-local-signup', {
    successRedirect : '/sponsorlogin', // redirect to the secure profile section
    failureRedirect : '/sponsorsignup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
};
