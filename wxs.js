/* jshint node:true */

var url = require('url');
var http = require('http');
var querystring = require("querystring");

function WXS(properties) {
	this.wxs = properties;
	if (this.wxs.restResource.indexOf('http://') !== 0) {
		this.wxs.restResource = 'http://' + this.wxs.restResource;
	}
	this.auth = 'Basic ' + new Buffer(this.wxs.username + ':' + this.wxs.password).toString('base64');
	this.parsed = url.parse(this.wxs.restResource);
	console.log("wxsclient url=" + this.wxs.restResource);
	console.log("wxsclient username=" + this.wxs.username);
	console.log("wxsclient password=" + this.wxs.password);
}

WXS.prototype = {
	put : function(key, value, callback) {
		var post_options = {
			hostname : this.parsed.hostname,
			port : '80',
			path : this.parsed.pathname + '/' + this.wxs.gridName + '/' + encodeURIComponent(key),
			method : 'POST',
			headers : {
				'Content-Type' : 'application/json',
				'Authorization' : this.auth
			},
			rejectUnauthorized : false,
			agent : false,
		};
		var post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
			});
			res.on('error', function(c) {
				console.log('post error: ' + c);
			});
			res.on('end', function() {
				console.log('post status ' + res.statusCode);
				callback();
			});
		});
		post_req.write(JSON.stringify(value));
		post_req.end();
	},
	get : function(key, callback) {
		var get_options = {
			hostname : this.parsed.hostname,
			port : '80',
			path : this.parsed.pathname + '/' + this.wxs.gridName + '/' + encodeURIComponent(key),
			method : 'GET',
			headers : {
				'Content-Type' : 'application/json',
				'Authorization' : this.auth
			},
			rejectUnauthorized : false,
			agent : false,
		};
		var get_req = http.request(get_options, function(res) {
			var resultString = '';
			res.on('data', function(chunk) {
				console.log('get response: ' + chunk);
				resultString += chunk;
			});
			res.on('error', function(c) {
				console.log('get error: ' + c);
			});
			res.on('end', function() {
				console.log('get status ' + res.statusCode);
				if (res.statusCode === 200) {
					callback(JSON.parse(resultString));
				} else {
					callback(); // error case
				}
			});
		});
		get_req.end();
	},
	remove : function(key, callback) {
		var get_options = {
			hostname : this.parsed.hostname,
			path : this.parsed.pathname + '/' + this.wxs.gridName + '/' +
					encodeURIComponent(key),
			port : '80',
			method : 'DELETE',
			headers : {
				'Content-Type' : 'application/json',
				'Authorization' : this.auth
			},
			rejectUnauthorized : false,
			agent : false,
		};
		var get_req = http.request(get_options, function(res) {
			var resultString = '';
			res.on('data', function(chunk) {
				console.log('get response: ' + chunk);
				resultString += chunk;
			});
			res.on('error', function(c) {
				console.log('get error: ' + c);
			});
			res.on('end', function() {
				console.log('get status ' + res.statusCode);
				callback();
			});
		});
		get_req.end();
	}
};

module.exports = WXS;
