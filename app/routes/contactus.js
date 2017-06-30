var express = require('express');
var router = express.Router();

router.get('/contactus', function(req, res) {

  res.render('contactus', {
    pageTitle: 'Contact Us',
    pageID: 'contactus'
  });

});

module.exports = router;
