var Sketch = {};

var socket = io.connect('https://45.55.48.195:8080/');
var usersList = [];

Sketch.userEmotion = [];

socket.on('connect', function() {
	console.log("Connected");
	socket.emit('color', {red: Sketch.red, green: Sketch.green, blue: Sketch.blue});
});

socket.on ('userslist', function (data) {

	console.log(data);
	usersList = data;

		

	for (var i = 0; i < data.length; i++) {
		if (Sketch.userEmotion[i] == null) {
			Sketch.userEmotion[i] = {};
		}
		Sketch.userEmotion[i].userList = usersList[i];
		document.getElementById("avatars").innerHTML = document.getElementById("avatars").innerHTML+'<div id="'+data[i]+'"></div>';
		console.log(document.getElementById("avatars").innerHTML);
		createParticle(data[i] , i * 100);
	}
});

socket.on ('disconnect', function(data) {
	console.log("Server said goodbye: " + data);
	for (var i = 0; i < usersList.length; i++) {
		if (Sketch.userEmotion[i].userList == data) {
			Sketch.userEmotion = Sketch.userEmotion.slice(i);
		}
	}

	if (Sketch.movers){
		for (var key in Sketch.movers) {
			if (key = data) {
				delete Sketch.movers[key];
			}
		}
	}
	console.log(Sketch.userEmotion);
	console.log(Sketch.movers);
});

socket.on ('emotion', function(data) {
	//console.log("emotion received");
	
	for (var i = 0; i < usersList.length; i++) {

		if (Sketch.userEmotion[i] == null) {
			Sketch.userEmotion[i] = {};
		}
	
		if (Sketch.userEmotion[i].userList == data.id) {
			Sketch.userEmotion[i].emotion = data.emotion;
		}
	} 
	//console.log(Sketch.userEmotion);
});

socket.on ('color', function(data) { 
	console.log("color received");
	for (var i = 0; i < usersList.length; i++) {
		for (var j = 0; j < usersList.length; j++) {
			if (Sketch.userEmotion[i] == null) {
				Sketch.userEmotion[i] = {};
			}
		
			if (Sketch.userEmotion[i].userList == data[j].user) {
				Sketch.userEmotion[i].red = data[j].red;
				Sketch.userEmotion[i].green = data[j].green;
				Sketch.userEmotion[i].blue = data[j].blue;
			}
		}
	} 
	console.log(data);
});

window.addEventListener('load', function() {
	// These help with cross-browser functionality (shim)
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	// The video element on the page to display the webcam
	Sketch.video = document.getElementById('thevideo');

	// if we have the method
	if (navigator.getUserMedia) {
		navigator.getUserMedia({ video: true }, function(stream) {
			Sketch.video.src = window.URL.createObjectURL(stream) || stream;
			Sketch.video.play();
		}, 
		function(error) {
			alert("Failure " + error.code);
		});
	}		

	document.getElementById('thevideo').style.visibility = "hidden";

	// Setting up tracker
	Sketch.tracker = new clm.tracker();
	Sketch.tracker.init(pModel);
	Sketch.tracker.start(Sketch.video);
	// i nitializing emotion classifier
	Sketch.ec = new emotionClassifier();
	Sketch.ec.init(emotionModel);
});

function createParticle(id, offset) {
	
	if (Sketch.movers == null) {
		Sketch.movers = {};
	}
	Sketch.movers[id] = {};
	Sketch.movers[id].brushes = [];
	for (var i = 0; i < 50; i++) {
		var brush = new Brush(id);
		brush.loc = createVector(width/2 + offset,height/2 + offset);
		Sketch.movers[id].brushes.push(brush);
	}
}
function deleteParticle(id) {
	
	if (Sketch.movers == null) {
		Sketch.movers = {};
	}
	Sketch.movers[id] = {};
	Sketch.movers[id].brushes = [];
	for (var i = 0; i < 50; i++) {
		var brush = new Brush(id);
		brush.loc = createVector(width/2 + offset,height/2 + offset);
		Sketch.movers[id].brushes.push(brush);
	}
}


function setup() {
	background(255);
	createCanvas(1280, 720);
	Sketch.red = int(random(0, 255));
	Sketch.green = int(random(0, 255));
	Sketch.blue = int(random(0, 255));
}

function draw() {
	background(255, 20);

	if (Sketch.video) {
		Sketch.facePos = Sketch.tracker.getCurrentParameters();
		if (Sketch.facePos) {
			Sketch.er = Sketch.ec.meanPredict(Sketch.facePos);
			if (Sketch.er) {
				//console.log("er true");
				for (var i = 0; i < Sketch.er.length; i++) {
					if (Sketch.er[3].value > 0.8) {
						//console.log("happy");
						socket.emit('emotion',"happy");
					} else if (Sketch.er[0].value > 0.3) {
						socket.emit('emotion',"angry");
					} else if (Sketch.er[1].value > 0.4) {
						socket.emit('emotion',"sad");
					} else if (Sketch.er[2].value > 0.9) {
						socket.emit('emotion',"surprised");
					} else {
						socket.emit('emotion',"no emotion");
					}
				}
			}
		}
	}

	if (Sketch.movers) {
		for (var key in Sketch.movers) {
			var mover = Sketch.movers[key];
			var brushes = mover.brushes;
		  	for (var j = 0; j < brushes.length; j++) {
	  			brushes[j].update();
		  		brushes[j].boundaries();
				brushes[j].displays();
			}
		}
	}
}
var limited;

var Brush = function(user){
	this.posX = 0;  
	this.loc = createVector(width/2,height/2);

	this.velocity = createVector(0,0);
	this.acceleration = createVector(this.posX,this.posY);
	this.generator = 0;

	this.stroke = 0;
	this.oldPosX = this.loc.x;
	this.oldPosY = this.loc.y;
	this.user = user;

}

Brush.prototype.update = function(){
	this.oldPosX = this.loc.x;
	this.oldPosY = this.loc.y;
	this.posX = int(randomGaussian() * 2);
	this.posY = int(randomGaussian() * 2);
	/*if (facePos){
	this.direction=createVector(randomGaussian(facePos[62][0],400)-this.oldPosX,randomGaussian(facePos[62][1],400)-this.oldPosY);
	this.acceleration=this.direction.normalize();
	
}else{*/
	
//if no emotions then normalize the acceleration if happy then add acceleration without normalizing
//console.log(emotionList);
	for (var i = 0; i < usersList.length; i++) {
		if (Sketch.userEmotion[i] == null) {
			Sketch.userEmotion[i] = {};
		}
			if (this.user == Sketch.userEmotion[i].userList) {
				if(Sketch.userEmotion[i].emotion == "angry"){
					this.acceleration.x = int(randomGaussian() * 10);
					this.acceleration.y = int(randomGaussian() * 10);
					limited = 7;
					console.log("angry");
				} else if (Sketch.userEmotion[i].emotion == "sad") {
					this.acceleration.x = this.posX;
					this.acceleration.y = this.posY;
					limited = 1;
					console.log("sad");
				} else if (Sketch.userEmotion[i].emotion == "surprised") {
					this.acceleration.x = int(randomGaussian() * 5);
					this.acceleration.y = int(randomGaussian() * 5);
					limited = 5;
					console.log("surprised");
				} else if (Sketch.userEmotion[i].emotion == "happy") {
					this.acceleration.x = this.posX;
					this.acceleration.y = this.posY;
					limited = 7;
					console.log("happy");
				} else {
				//console.log("no emotions detected");
				this.acceleration.x = this.posX;
				this.acceleration.y =  this.posY;
				limited = 4;
				}
			}
		
	}

	this.velocity.add(this.acceleration);
	this.loc.add(this.velocity);
	this.velocity.limit(limited);
}

Brush.prototype.boundaries = function() {
	if (this.loc.x + 5 > width) {
		this.loc.x = width - 5;
		this.velocity.x *= -1;
	} else if (this.loc.x - 5 < 0) {
		this.velocity.x *= -1;
		this.loc.x = 5;
	}
	if (this.loc.y + 5 > height) {
		this.velocity.y *= -1;
		this.loc.y = height - 5;
	} else if (this.loc.y - 5 < 0) {
		this.velocity.y *= -1;
		this.loc.y = 5;
	}
}

Brush.prototype.displays = function(){
	//socket.emit('brush', {oldPosXU:this.oldPosX, oldPosYU:this.oldPosY, locXU:this.loc.x, locYU})
	//this.pix=int(this.loc.x)+int(this.loc.y)*int(width);
	this.pix = int(this.loc.y) * int(width) * 4 + int(this.loc.x) * 4;
	// console.log("loc"+this.pix);
	// console.log("R"+capture.pixels[this.pix+1]);
	// console.log("g"+capture.pixels[this.pix+2]);
	// console.log("b"+capture.pixels[this.pix+3]);
	// this.r=capture.pixels[int(this.pix)];
	// this.g=capture.pixels[int(this.pix+1)];
	// this.b=capture.pixels[int(this.pix+2)];
	//this.g=green(capture.pixels[int(this.pix)]);
	// this.b=blue(capture.pixels[int(this.pix)]);
	

	for (var i = 0; i < usersList.length; i++) {
		if (this.user == Sketch.userEmotion[i].userList) {
			stroke(Sketch.userEmotion[i].red, Sketch.userEmotion[i].green, Sketch.userEmotion[i].blue);
			if (Sketch.userEmotion[i].emotion == "happy") {	
				strokeWeight(1);
				var hair=map(noise(0),0,1,3,5);
	   
	    		push();
	    		translate(this.loc.x, this.loc.y);
	   			for (var i=0; i<8; i++) {
	      			line(-hair, -hair, hair, hair);
	      			rotate(random(0, 2*PI));
	    		}
	    		pop();

			} else if (Sketch.userEmotion[i].emotion == "surprised") {
				noFill();
				strokeWeight(1);
				ellipse(this.loc.x,this.loc.y,random(5,9),random(5,9));
			} else {
				strokeWeight(random(1,4));
				line(this.oldPosX,this.oldPosY,this.loc.x,this.loc.y);
			}
		}
	}
}







