var express = require('express');
var router = express.Router();

router.get('/startacause', function(req, res) {

  res.render('startacause', {
    pageTitle: 'Startacause',
    pageID: 'startacause'
  });

});

module.exports = router;
