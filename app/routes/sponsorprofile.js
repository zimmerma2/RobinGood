var express = require('express');
var mongoose = require('mongoose');
var Sponsor = require('../models/sponsor');
var router = express.Router();

router.get('/sponsorprofile/:id', function(req, res) {
  var candidateId = req.params.id;
  Sponsor.find({'_id': {'$eq': candidateId}},{},function(e,docs){
      res.render('sponsorprofile', {
        pageTitle: 'SPONSOR_PROFILE',
        pageID: 'sponsorprofile'
      });
  });
});

module.exports = router;
