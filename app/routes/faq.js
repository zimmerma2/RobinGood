var express = require('express');
var router = express.Router();

router.get('/faq', function(req, res) {

  res.render('faq', {
    pageTitle: 'FAQ',
    pageID: 'faq'
  });

});

module.exports = router;
