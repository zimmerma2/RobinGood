var express = require('express');
var app = module.exports = express();
var auth =  require('./config.json');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
var configDB = require('./config/database.js');
var dataFile = require('./data/data.json');
var expressValidator = require('express-validator');
var fs = require('fs')
var flash    = require('connect-flash');
var logger = require("morgan");
var marked = require('marked');
var mg = require('nodemailer-mailgun-transport');
var mongoose = require('mongoose');
mongoose.connect(configDB.url); // connect to our database
var db = mongoose.connection; // Make our db accessible to our route
var morgan       = require('morgan');
var nodeMailer = require('nodemailer');
var nconf = require('nconf');
var path = require('path');
var passport = require('passport');
var reload = require('reload');
var session      = require('express-session');

const port = process.env.PORT || 3000;

var server = require('http').createServer(app);

// parse application/x-www-form-urlencoded
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(bodyParser());
// app.use(cookieSession()); // Express cookie session middleware
app.use(passport.initialize());   // passport initialize middleware
app.use(passport.session());      // passport session middleware


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// Define custom form validators
app.use(expressValidator({
 customValidators: {
    isImage: function(filename) {
        const result =  filename.match(/\.(jpg|jpeg|png|gif)$/);
        return (result != null) ? true : false;
    }
 }
}));

app.use(function(req, res, next) {
    if (!req.sponsor && !req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    }
    next();
});

// log requests to stdout and also
// log HTTP requests to a file in combined format
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

// app.set('port', process.env.PORT || 3000 );

// TODO Exposing all the installed modules is probably not safe. Should have a dedicated space for client-side scripts, or use cdn versions
// Allows use of local js stored in modules
app.use(express.static('node_modules'));

app.use(express.static(path.join(__dirname + '/public')));

app.locals.siteTitle = 'Robin Good';
app.locals.allSpeakers = dataFile.speakers;

require('./config/passport')(passport); // pass passport for configuration

app.use(express.static('app/public'));
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(require('./routes/index'));
app.use(require('./routes/faq'));
app.use(require('./routes/contactus'));
app.use(require('./routes/about'));
app.use(require('./routes/story'));
app.use(require('./routes/verificationSent'));
app.use(require('./routes/user_verification'));
app.use(require('./routes/sponsor_verification'));

// GOOGLE MAPS API Key ==========
app.locals.gmapsAPI = 'AIzaSyD8jTZcYe852PX8u9DmSZQPgeMpbZUM51w';

// PASSPORT ================

app.use(session({
  secret: 'my_session_secret',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// configuration ====================``===========================================


// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// END OF PASSPORT ==============

// =====================================
// 404 Not Found =======================
// =====================================
// app.use(function(req, res, next){
//   res.status(404);
//   res.render('404.ejs', {
//     pageTitle: '404: Not Found',
//     pageID: '404'
//   });
//   return;
// });

// =====================================
// Error Handlers ======================
// =====================================
app.use( function multerErrorHandler (err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.error('\n\nFile too large!\n\n');
    next();
  } else {
    next(err);
  }
});


// Listen for an application request on designated port
server.listen(port, function () {
  console.log('Web app started and listening on http://localhost:' + port);
});

reload(server, app);
