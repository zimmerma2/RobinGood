// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    console.log('isAuthenticated was successful.');
    return next();
  }
  console.log('isAuthenticated failed again.');
  // if they aren't redirect them to the login page
  res.redirect('/userlogin');
}

// Export functions
exports.isLoggedIn = isLoggedIn;
