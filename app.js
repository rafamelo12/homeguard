/* jshint node:true */

/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var cache = require('./routes/cache');
var http = require('http');
var path = require('path');
var jade = require('jade');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
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
app.post("/")
app.get("/takepicture", function (req, res){
    /* Default settings */
    var host = 'http://neryuuk.cloudant.com';
    var database = 'homeguard';
    var file = 'file.jpg';
    var IP = '70.30.52.140';
    var PORT = '5050';
    var WebSocketClient = require('websocket').client; // Library used to create the websocket
    // var cradle = require('cradle'); // Library used to connect with Cloudant
    // var c = new(cradle.Connection)(host);
    var client = new WebSocketClient(); // Creating the websocket
    // var homeguard = c.database(database); // Getting the database from Cloudant
    client.connect('ws://'+IP+':'+PORT); // Connecting to the Raspberry Pi


    function getFile (id){ // Function to get the file from Cloudant and embed in a HTML
       console.log('Get file.');
       var path = host+'/'+database+'/'+id+'/'+file;
       console.log('path: '+path);
       res.send('<html><body><div align="center"><h1>Your picture: </h1><br><img src="'+path+'" height="500"></div>');

    }
    /* Creating the functions to handle possible errors and the when the connection
       is established.
    */
    client.on('connect', function (connection){
       console.log("Connected!");
       connection.on('error', function (error){
          console.log("Connection Error: " + error.toString());
       });
       connection.on('close', function(){
          console.log('Closed connection.');
       });
       connection.on('message', function (message){
          var msgUtf8 = message.utf8Data;
          console.log("Received: " + message.utf8Data);
          // Parsing the message received from the RPi server and getting the id
          var parsed = msgUtf8.toString().split(":");
          var status_code = parsed[0];
          var id = parsed[1].trim();
          console.log("id: " + id);
          getFile(id);
          res.end();
          connection.close();
       });
    });
        
});
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});