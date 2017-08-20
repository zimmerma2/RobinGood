module.exports = function(app, passport) {
  // =====================================
  // USER LOGIN  =========================
  // =====================================
  // show the signup form
  app.get('/sponsorlogin', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('sponsorlogin.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/sponsorlogin', passport.authenticate('sponsor-local-login', {
    successRedirect : '/sponsor_profile', // redirect to the secure profile section
    failureRedirect : '/sponsorlogin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
};
