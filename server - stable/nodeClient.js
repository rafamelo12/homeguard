var net = require('net');
var bl = require('bl');

var py_host = '138.51.58.186'; //IP
var py_port = 5000;

var client = new net.Socket();

// client.setEncoding('base64');

client.setTimeout(1000);

client.connect(py_port, py_host, function() {
    console.log('Connected to ' + py_host + ':' + py_port + '...');
    client.write('i\'m your client, bitch!');
});

client.on('data', function() {
	client.pipe(bl(function(err,data) {
		if(err)
			console.error(err);
		console.log('Data received: ' + data);
	}));
    //client.destroy();
});

client.on('close', function() {
    console.log('Connection closed.\n');
});

client.on('timeout', function() {
    console.log('Timeout.\n');
})