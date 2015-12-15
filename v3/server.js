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
var users = [];
var colors = [];


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
		
		if (colors[users.length]==null){
			colors[users.length]={};
			colors[users.length].user = socket.id;
		}
		
		users[users.length]=socket.id;
		
		io.emit('userslist',users);
		console.log(users);
		//console.log(typeof(users));

		console.log("We have a new client: " + socket.id);
		
		socket.on('color', function(data){
			for (var i = 0; i < users.length; i++){
				if (socket.id == colors[i].user){
					colors[i].red = data.red;
					colors[i].green = data.green;
					colors[i].blue = data.blue;
				}
			}
			io.emit('color', colors);
			console.log(data.red);
		});
																																																																																																																																																																																																																																																																																																																																																																																																													

		socket.on('emotion', function(data) {
			//console.log("emotion:");
			io.emit('emotion', {emotion:data, id:socket.id});
		});

		socket.on('disconnect',function(){

			for(var i = users.length - 1; i >= 0; i--) {
				if(users[i] ==socket.id) {
					users.splice(i, 1);
					
					console.log(socket.id + " disconnected");
					console.log(users)
				}

			}

			for (var i = colors.length - 1; i >= 0; i--) {
				if (colors[i].user == socket.id ){
					colors.splice(i, 1);
				}
			}

		io.emit('disconnect',socket.id);
		});

	}
);