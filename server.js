var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	path = require('path');

// create http server
var staticPath = path.join(__dirname, './public');
app.use(express.static(staticPath));

app.get('/', function (req, res) {
  res.sendFile( path.join(staticPath, 'index.html') );
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


// socket.io
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

/*
var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime');

var cache = {};

var server = http.createServer(function(req, res) {
	var filePath = '';
	if(req.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + req.url;
	}

	var absPath = './' + filePath;
	serveStatic(res, cache, absPath);
});

server.listen(3000, function() {
	console.log('server listening on port 3000.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

function send404(res) {
	res.writeHead(404, {
		'Content-Type': 'text-plain'
	});

	res.write('Error 404 : resource not found');
	res.end();
}

function sendFile(res, filePath, fileContents) {
	res.writeHead(
		200,
		{
			"content-type" : mime.lookup( path.basename(filePath) )
		}
	);
	res.end(fileContents);
}

function serveStatic(res, cache, absPath) {
	if (cache[absPath] ) {
		sendFile(res, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res);
			}
		});
	}
}
*/