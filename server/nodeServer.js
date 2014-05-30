var net = require('net')
var fs = require('fs')
var bl = require('bl')
//-------------------------------------
var tcp_port = 4040
var tpc_host = 'localhost'
//-------------------------------------

var imgNum = 0;

// Creates TCP server
var tcp_server = net.createServer();

// When connection is received, creates a socket and retrieves
// all data using a buffer list, writting it to a file.
tcp_server.on('connection', function(socket) {
    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    console.log("server connected to " + socket.name + '\n');

    socket.pipe(bl(function(err, data) {
        if (err)
            console.error(err);

        console.log("receiving file...");

        var fd = 'image' + imgNum + '.jpg';

        fs.open(fd, 'w', function(err, fd) {
            if (err)
                console.log("Error at opening the file: " + err);
            console.log("file " + imgNum + " successfully created and opened")
        });

        fs.writeFile(fd, data, function(err) {
            if (err) console.log("error at writting: " + err);
            console.log("file transfer complete\n");
            imgNum++;
        })

    }))
});

tcp_server.listen(tcp_port, tpc_host, function() {
    console.log("server bound to " + tpc_host + ':' + tcp_port);
})