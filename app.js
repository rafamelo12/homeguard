/* jshint node:true */

/**
 * Module dependencies.
 */
var express   = require('express');
var http      = require('http');
var path      = require('path');
var passport  = require('passport');
var flash     = require('connect-flash');
var session   = require('express-session');
var app       = express();

require('./config/passport.js')(passport);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session({ secret: 'somerandomtextyeahthatsright',
                  saveUninitialized: true,
                  resave: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.favicon(path.join(__dirname + '/public/images/favicon.png')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tmp')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}



var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

require('./routes/routes.js')(app, passport, server);