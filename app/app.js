var express = require('express');
var app = module.exports = express();
var auth =  require('./config.json');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var configDB = require('./config/database.js');
var dataFile = require('./data/data.json');
var fs = require('fs')
var flash    = require('connect-flash');
var logger = require("morgan");
var mg = require('nodemailer-mailgun-transport');
var mongoose = require('mongoose');
var morgan       = require('morgan');
var nodeMailer = require('nodemailer');
var nconf = require('nconf');
var path = require('path');
var passport = require('passport');
var reload = require('reload');
var session      = require('express-session');

const port = process.env.PORT || 3000;

var server = require('http').createServer(app);


// app.set('port', process.env.PORT || 3000 );
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', 'app/views');
app.set('views', path.join(__dirname,'views'));

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


// PASSPORT ================
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// END OF PASSPORT ==============

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));
// app.use(express.static(path.join(__dirname,'public')));

// Listen for an application request on designated port
server.listen(port, function () {
 console.log('Web app started and listening on http://localhost:' + port);
});

reload(server, app);
