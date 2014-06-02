var net = require('net');

var py_host = '138.51.229.242' //IP
var py_port = 5000

var client = new net.Socket();

//client.setEnconding('base64');

client.setTimeout(10000);

client.connect(py_port, py_host, function() {
    console.log('connected to server ' + py_host + ':' + py_port + '...');
    client.write('i\'m your client, bitch!');
});

client.on('data', function(data) {
    console.log('data received: ' + data);
    client.destroy();
});

client.on('close', function() {
    console.log('connection with server closed.')
});

client.on('timeout', function() {
    console.log('timeout!');
})