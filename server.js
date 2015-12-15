var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url =  require('url');

var options = {
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

function handleIt(req, res) {
	var parsedUrl = url.parse(req.url);

	var path = parsedUrl.pathname;
	if (path == "/") {
		path = "index.html";
	}

	fs.readFile(__dirname + path,

		// Callback function for reading
		function (err, fileContents) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + req.url);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(fileContents);
  		}
  	);	
	
	// Send a log message to the console
	console.log("Got a request " + req.url);
}

var httpServer = https.createServer(options, handleIt);
httpServer.listen(8080);


console.log('Server listening on port 8080');

//////////////////////////
	var users=[];

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		users[users.length]=socket.id;
		io.emit('userslist',users);
		console.log(users);
		console.log(typeof(users));

		console.log("We have a new client: " + socket.id);
		
		socket.on('peerid', function(data) {
			//io.sockets.emit("peerid", data);
			socket.broadcast.emit('peerid', data);

			for (var c = 0; c < clients.length; c++) {
				socket.emit('peerid',clients[c]);
			}

			clients.push(data);
		});

		socket.on('emotion', function(data) {
			io.sockets.emit('emotion', data);
		});
	}
);