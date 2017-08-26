var express = require('express');
var router = express.Router();

router.get('/verification_sent', function(req, res) {

  res.render('verification_sent.pug', {
    pageTitle: 'Verification Sent',
    pageID: 'verification_sent'
  });

});

module.exports = router;
