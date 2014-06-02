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

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

//-------------------------------------------
var net = require('net');
var fs = require('fs');
var bl = require('bl');
var uuid = require('node-uuid');
//-------------------------------------
var tcp_port = 5050;
var tpc_host = 'localhost';
//-------------------------------------

var imgNum = 0;

// Creates TCP server
var tcp_server = net.createServer();

// When connection is received, creates a socket and retrieves
// all data using a buffer list, writting it to a file.
tcp_server.on('connection', function(socket) {
    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    console.log("Server connected to " + socket.name + '\n');

    socket.pipe(bl(function(err, data) {
        if (err)
            console.error(err);

        console.log("Receiving file...");

        var fd = uuid.v4() + '.jpg';

        fs.open(fd, 'w', function(err, fd) {
            if (err)
                console.log("Error opening the file: " + err);
            console.log("File " + fd + " successfully received!")
        });

        fs.writeFile(fd, data, function(err) {
            if (err) console.log("Error writting: " + err);
            console.log("File transfer complete\n");
            imgNum++;
        });
    }));
});

tcp_server.listen(tcp_port, tpc_host, function() {
    console.log("Server bound to " + tpc_host + ':' + tcp_port);
})