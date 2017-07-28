var express = require('express');
var router = express.Router();
var app = require('../app');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var nodeMailer = require('nodemailer');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get('/contactus', function(req, res) {

  res.render('contactus.jade', {
    pageTitle: 'Contact Us',
    pageID: 'contactus'
  });
});

//route to send the form
router.post('/contactus/send', function(req, res) {

  var transporter = nodeMailer.createTransport({

  service : 'Gmail',
  auth :
  {
    user:'costofgiving@gmail.com',
    pass:'robingood2018'
  }
  });

  var mailOptions =
  {
    from: req.body.name + ' :' + req.body.email,
    to: 'costofgiving@gmail.com',
    subject:'A simple test for contact form of Robin Good',
    text:'This a a simple test from Name:'+ req.body.name+' Email:'+req.body.email+' Message:'+req.body.message,
    html:'<p><ul><li>this a a simple test from Name:'+ req.body.name+'</li><li> Email:'+req.body.email+'</li><li>Message:'+req.body.message+'</li></ul>',
  }

  transporter.sendMail(mailOptions, function (err, info)
  {
    if(err)
    {
      console.log(err);
      res.redirect('/');
    }else
    {
      console.log('Message send');
      res.redirect('/');
    }
  });

});

module.exports = router;
