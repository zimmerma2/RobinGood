var express = require('express');
var reload = require('reload');
var app = module.exports = express();
var dataFile = require('./data/data.json');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser')
var path = require("path");
var fs = require('fs')
var logger = require("morgan");
var mg = require('nodemailer-mailgun-transport');
var nconf = require('nconf');
var auth =  require('./config.json');
const port = process.env.PORT || 3000;

var server = require('http').createServer(app);

// app.set('port', process.env.PORT || 3000 );
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

// parse application/x-www-form-urlencoded
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// log requests to stdout and also
// log HTTP requests to a file in combined format
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

var path = require('path');
var bodyParser = require('body-parser');
var nodeMailer = require('nodemailer');

var app = express();


app.set('views', path.join(__dirname,'views'));
app.set('view engine','jade');


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));
// app.use(express.static(path.join(__dirname,'public')));

// Listen for an application request on designated port
server.listen(port, function () {
 console.log('Web app started and listening on http://localhost:' + port);
});

reload(server, app);
