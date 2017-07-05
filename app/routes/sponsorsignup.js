var express = require('express');
var router = express.Router();

router.get('/sponsorsignup', function(req, res) {

  res.render('sponsorsignup', {
    pageTitle: 'Sponsor signup',
    pageID: 'sponsorsignup'
  });

});

module.exports = router;
