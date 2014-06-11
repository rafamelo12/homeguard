var host = 'http://neryuuk.cloudant.com';
var database = 'homeguard';
var file = 'file.jpg';
var IP = '70.30.52.140';
var PORT = '5050';
var http = require('http');
var WebSocketClient = require('websocket').client;
var cradle = require('cradle');
var c = new(cradle.Connection)(host);
var client = new WebSocketClient();
var homeguard = c.database(database);
client.connect('ws://'+IP+':'+PORT);


function getFile (id){
   console.log('Get file.')
   var path = host+'/'+database+'/'+id+'/'+file;

}
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
      var parsed = msgUtf8.toString().split(":");
      var status_code = parsed[0];
      var id = parsed[1].trim();
      console.log("id: " + id);
      getFile(id);
   });
});