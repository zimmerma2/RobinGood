var express = require('express');
var router = express.Router();

router.get('/signup', function(req, res) {

  res.render('signup', {
    pageTitle: 'Signup',
    pageID: 'signup'
  });

});

module.exports = router;
