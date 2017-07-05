var express = require('express');
var router = express.Router();

router.get('/usersignup', function(req, res) {

  res.render('usersignup', {
    pageTitle: 'User signup',
    pageID: 'usersignup'
  });

});

module.exports = router;
