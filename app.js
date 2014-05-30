/* jshint node:true */

/**
 * Module dependencies.
 */
var express = require('express'),
  routes = require('./routes'),
  cache = require('./routes/cache'),
  http = require('http'),
  path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get("/cache/:key", cache.getCache);
app.put("/cache", cache.putCache);
app.delete("/cache/:key", cache.removeCache);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
