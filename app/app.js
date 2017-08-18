var express = require('express');
var app = module.exports = express();
var auth =  require('./config.json');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
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
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(expressValidator());

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

app.use(express.static('app/public'));
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(require('./routes/index'));
app.use(require('./routes/stories'));
app.use(require('./routes/newstory'));
app.use(require('./routes/editstory'));
app.use(require('./routes/speakers'));
app.use(require('./routes/faq'));
app.use(require('./routes/contactus'));
app.use(require('./routes/about'));
app.use(require('./routes/story'));
app.use(require('./routes/user_verification'));
app.use(require('./routes/sponsor_verification'));

app.locals.db = db;

// PASSPORT ================
// configuration ====================``===========================================
require('./config/passport')(passport); // pass passport for configuration

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/usersignup.js')(app, passport);
require('./routes/userlogin.js')(app, passport);
require('./routes/sponsorsignup.js')(app, passport);
require('./routes/sponsorlogin.js')(app, passport);
// END OF PASSPORT ==============


// Listen for an application request on designated port
server.listen(port, function () {
 console.log('Web app started and listening on http://localhost:' + port);
});

reload(server, app);
