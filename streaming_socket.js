var express = require('express');
var Promise = require('bluebird');
var http      = require('http');
var path      = require('path');
var fs = require('fs');
var uuid = require('node-uuid');
var app       = express();

var socket = require('websocket').client;
var cradle = require('cradle');
var host = 'http://neryuuk.cloudant.com'; // Host in Cloudant
var c = new(cradle.Connection)(host);
var homeguard = c.database(database); // Getting a instance of the database from Cloudant
var client = new WebSocketClient(); // Creating the websocket
var IP 	= 'neryuuk.ddns.net'; // IP of Raspberyy Pi device
var PORT = '5050'; // Port where the Python server in Raspberry Pi is listening

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tmp')));