/* jshint node:true */

/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
// var cache = require('./routes/cache');
var http = require('http');
var path = require('path');
var jade = require('jade');
var cradle = require('cradle');
var bcrypt = require('bcrypt');
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
app.use(express.static(path.join(__dirname, 'tmp')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
// app.get("/cache/:key", cache.getCache);
// app.put("/cache", cache.putCache);
// app.delete("/cache/:key", cache.removeCache);
app.post("/")
app.get("/takepicture", function (req, res){
    /* Default settings */
    var host = 'http://neryuuk.cloudant.com'; // Host in Cloudant
    var database = 'homeguard'; // Name of the Database in Cloudant
    var file = 'file.jpg'; // Name of the attachment
    var IP = 'neryuuk.noip.me'; // IP of Raspberyy Pi device
    var PORT = '5050'; // Port where the Python server in Raspberry Pi is listening
    var WebSocketClient = require('websocket').client; // Library used to create the websocket
    var fs = require('fs'); // Library used to save the file in the server
    var uuid = require('node-uuid'); // Library used to create uuid to solve async file saving problem
    var c = new(cradle.Connection)(host); // Setting up a connection to Cloudant
    var client = new WebSocketClient(); // Creating the websocket
    var homeguard = c.database(database); // Getting a instance of the database from Cloudant
    client.connect('ws://'+IP+':'+PORT); // Connecting through the websocket to the Raspberry Pi


    function getFile (id){ // Function to get the file from Cloudant and embed in a HTML
    var attachmentName = 'file.jpg'; // 
    var fileName = uuid.v4(); // Generating the uuid to save the file into server
    var downloadPath = path.join(__dirname, '/tmp/pictures/'+fileName.toString()+'.jpg'); // Setting the path of where to save the file
    var writeStream = fs.createWriteStream(downloadPath); // Creating the write stream to save the file into the server
    /* Getting the attachment from the Cloudant document and setting it 
        into a variable so we can pipe to the write stream 
    */
    var readStream = homeguard.getAttachment(id, attachmentName, function (err){
      if(err){
        console.log("Error: " + err.toString());
        return
      }
      /*
        Now that the file is saved, set the server path to it and embed in a HTML response.
      */
      var serverPath = '/pictures/'+fileName.toString()+'.jpg';
      res.send('<html><head><link rel="stylesheet" href="stylesheets/button.css"><title>HomeGuard</title></head><body><div align="center"><h1>Your picture: </h1><br><img src="'+serverPath+'" height="500"><br><a href="/takepicture" class="button"></div>');
      res.end(); // End the response to the request
      return;
    });
    readStream.pipe(writeStream); // Piping the file into the write stream
    
    
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
          /* 
            Checking if any error ocurred, if the status code sent from
            RPi is 409 an error occured so the response is ended and
            connection closed.
          */
          if(status_code == '409'){
            console.log(msgUtf8);
            res.send('<html><body><div align="center">'+msgUtf8+'</div>');
            res.end();
            connection.close();
          }
          var id = parsed[1].trim();
          console.log("id: " + id);
          getFile(id);
          connection.close();
       });
    });
        
});
app.get("/login", function (req, res){
  res.render("login.jade");
});
app.post("/login2", function (req, res){

  var c = new(cradle.Connection)('http://rafamelo12.cloudant.com', {
    auth: { username: 'rafamelo12', password: 'bduniversity'}
  });
  var users = c.database('users');
  users.get(req.body.email, function (err, doc){
    // console.log(doc.password);
    bcrypt.compare(req.body.password, doc.password, function (err, response){
      if(response){
        res.send('Hello, '+doc.name+'! You\'re logged into HomeGuard!!');  
        res.end();
      }else{
        res.send('Wrong password.');  
        res.end();
      }

    });
      
    
  });
  // console.log(req.body.email);
  // console.log(req.body.password);
  
});
app.get('/register', function (req, res){
  res.render("register.jade");
});
app.post('/register2', function (req, res){
  var c = new(cradle.Connection)('http://rafamelo12.cloudant.com', {
    auth: { username: 'rafamelo12', password: 'bduniversity'}
  });
  var users = c.database('users');
  bcrypt.genSalt(10, function (err, salt){
    bcrypt.hash(req.body.password, salt, function (err, hash){
      users.save(req.body.email, {
        password: hash
      }, function (err, response){
        console.log('Written in db.');
        res.end();
      });
    });
  });
});
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});