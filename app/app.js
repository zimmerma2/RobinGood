var express = require('express');
var reload = require('reload');
var app = express();
var dataFile = require('./data/data.json');

app.set('port', process.env.PORT || 3000 );
app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.locals.siteTitle = 'Robin Good';

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/speakers'));
app.use(require('./routes/usersignup'));
app.use(require('./routes/sponsorsignup'));
app.use(require('./routes/login'));
app.use(require('./routes/contactus'));
app.use(require('./routes/about'));
app.use(require('./routes/startacause'));

var server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});

reload(server, app);
