var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/user');
var router = express.Router();

router.get('/user/:id', function(req, res) {
  var candidateId = mongoose.Types.ObjectId(req.params.id);
  User.find({'_id': {'$eq': candidateId}},{},function(e,docs){
      res.render('userprofile.jade', {
          "userprofile" : docs[0]
      });
  });
});

module.exports = router;
