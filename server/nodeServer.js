var net = require('net');
var fs = require('fs');
var bl = require('bl');
var uuid = require('node-uuid');
//-------------------------------------
var tcp_port = 5050;
var tpc_host = '138.51.223.241';
//-------------------------------------

var fileNum = 0;

// Creates TCP server
var tcp_server = net.createServer();

var clients = []

// When connection is received, creates a socket and retrieves
// all data using a buffer list, writting it to a file.
tcp_server.on('connection', function(socket) {
    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    clients.push(socket);
    console.log('number of connections: ' + clients.length);
    console.log("Server connected to " + socket.name + '\n');

    socket.pipe(bl(function(err, data) {
        if (err)
            console.error(err);

        console.log("Receiving file...");

        var file_descriptor = uuid.v4() + '.jpg';

        fs.open(file_descriptor, 'w', function(err, fd) {
            if (err)
                console.log("Error opening the file: " + err);
            console.log("File " + file_descriptor + " successfully received!")
        });

        fs.writeFile(file_descriptor, data, function(err) {
            if (err) console.log("Error writting: " + err);
            console.log("File transfer complete\n");
            fileNum++;
        });
    }));

    socket.on('end', function() {
        clients.splice(clients.indexOf(socket), 1);
        console.log('connection with ' + socket.name + ' closed.');
        console.log('number of connections: ' + clients.length);
    })
});

tcp_server.listen(tcp_port, tpc_host, function() {
    console.log("Server bound to " + tpc_host + ':' + tcp_port);
})