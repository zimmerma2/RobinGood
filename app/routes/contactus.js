var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var app = require('../app');
var http = require('http');

router.get('/contactus', function(req, res) {

  res.render('contactus', {
    pageTitle: 'Contact Us',
    pageID: 'contactus'
  });
});


app.post('/contactus', function(req, res) {

  var smtpTransporter = nodemailer.createTransport("SMTP", {
    service: 'Gmail',
    secureConnection: true,
    port: 4000,
      auth: {
        user: 'aleksandar.hrusanov@gmail.com',
        pass: 'hexxxxen123'
      }
  });
  var mailOptions = {
       from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
       to: 'aleksandar.hrusanov@gmail.com',
       subject: 'Website contact form',
       text: req.body.message
   }
   smtpTransporter.sendEmail(mailOptions, function(error, response) {
     if(error){
       console.log(error);
       res.render('contactus', {
         title: 'Contact',
         page: 'contact',
         type: 'error',
         description: 'email not succesfully sent'
       });
     }
     else {
       console.log("Sent");
       res.render('contactus', {
         title: 'Contact',
         page: 'contact',
         type: 'success',
         description: 'email successfully sent.'
       });
     }
   });
 });
 var server = http.createServer(app).listen(4000,function(){
   console.log("Server running on 4000");
 });


//   var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'aleksandar.hrusanov@gmail.com',
//       pass: 'hexxxxen123'
//     }
//   });
//
//   var mailOptions = {
//        from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
//        to: 'aleksandar.hrusanov@gmail.com',
//        subject: 'Website contact form',
//        text: req.body.message
//    };
//
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// });




//
// app.post('/contactus', function (req, res) {
//   var mailOpts, smtpTrans;
//   //Setup Nodemailer transport, I chose gmail. Create an application-specific password to avoid problems.
//   smtpTrans = nodemailer.createTransport('SMTP', {
//       service: 'Gmail',
//       auth: {
//           user: "aleksandar.hrusanov@gmail.com",
//           pass: "hexxxxen123"
//       }
//   });
//   //Mail options
//   mailOpts = {
//       from: req.body.name + ' &lt;' + req.body.email + '&gt;', //grab form data from the request body object
//       to: 'aleksandar.hrusanov@gmail.com',
//       subject: 'Website contact form',
//       text: req.body.message
//   };
//   smtpTrans.sendMail(mailOpts, function (error, response) {
//       //Email not sent
//       if (error) {
//           res.render('contactus', { title: 'Raging Flame Laboratory - Contact', msg: 'Error occured, message not sent.', err: true, page: 'contactus' })
//       }
//       //Yay!! Email sent
//       else {
//           res.render('contactus', { title: 'Raging Flame Laboratory - Contact', msg: 'Message sent! Thank you.', err: false, page: 'contactus' })
//       }
//   });
// });

module.exports = router;
