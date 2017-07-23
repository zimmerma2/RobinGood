
var express = require('express');
var reload = require('reload');
var app = module.exports = express();
var dataFile = require('./data/data.json');
var nodemailer = require('nodemailer');

app.set('port', process.env.PORT || 3000 );
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.locals.siteTitle = 'Robin Good';
app.locals.allSpeakers = dataFile.speakers;

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/speakers'));
app.use(require('./routes/usersignup'));
app.use(require('./routes/sponsorsignup'));
app.use(require('./routes/login'));
app.use(require('./routes/faq'));
app.use(require('./routes/contactus'));
app.use(require('./routes/about'));
app.use(require('./routes/startacause'));


app.listen(8000);
console.log('Web server started.');
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});

reload(server, app);

app.post('/contactus', function(req, res) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
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
   };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});
