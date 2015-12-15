// These help with cross-browser functionality (shim)
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// The video element on the page to display the webcam
var video = document.getElementById('thevideo');
var canvasList[];
// if we have the method
if (navigator.getUserMedia) {
	navigator.getUserMedia({video: true}, function(stream) {
			video.src = window.URL.createObjectURL(stream) || stream;
			video.play();
		}, function(error) {alert("Failure " + error.code);});
}		
document.getElementById('thevideo').style.visibility = "hidden";

var usersList[];
var socket = io.connect('https://45.55.48.195:8080/');
var myp5[];
var movers=[];
var userEmotion=[][];

socket.on('connect', function() {
	console.log("Connected");
});

socket.on('userslist', function (data) {
	console.log(data);
	usersList=data;
	for(var i = 0; i <data.length; i++) {
	document.getElementById("avatars").innerHTML = document.getElementById("avatars").innerHTML+'<div id="'+data[i]+'"></div>';
	console.log(document.getElementById("avatars").innerHTML);
	myp5[i] = new p5(canvasList[i] =function (p){

function setup() {

  	background(255);

  	 createCanvas(320, 240);
 
  	for (var i=0; i<50; i++) {
  		movers.push(new Brush());
  	}
  };

function draw() {

background(255,20);
  for (var i=0; i<movers.length; i++) {
  	movers[i].update();
  	movers[i].boundaries();
	movers[i].displays();

}
}
};,''+"'+data[i]+'");
	}
});

socket.on('goodbye',function(data) {
	console.log("Server said goodbye: " + data);
});
socket.on('emotion',function(data){
	for(var i = 0; i <usersList.length; i++) {
userEmotion[i][0]=usersList[i];
if (userEmotion[i][0]==data.id){
	userEmotion[i][1]==data.emotion;
}
} 
});

//setting up tracker
var tracker=new clm.tracker();
tracker.init(pModel);
tracker.start(video);
//initializing emotion classifier
var ec = new emotionClassifier();
	ec.init(emotionModel);
if (video){
var	facePos = tracker.getCurrentParameters();
}

if(facePos){
var er = ec.meanPredict(facePos);
	if (er) {
		for (var i = 0;i < er.length;i++) {
	
			if (er[3].value > 0.8) {
				socket.emit('emotion',"happy");

			} else if (er[0].value > 0.3) {
				socket.emit('emotion',"angry");
				
			} else if (er[1].value > 0.4) {
				socket.emit('emotion',"sad");
				
			} else if (er[2].value > 0.9) {
				socket.emit('emotion',"surprised");
		
			} else {
				socket.emit('emotion',"no emotion");
		
			}
		}
	}
}



var limited;

var Brush = function(){
	this.posX=0;n    
	this.loc=createVector(width/2,height/2);

	this.velocity=createVector(0,0);
	this.acceleration=createVector(this.posX,this.posY);
	this.generator=0;

	this.stroke=0;
	this.oldPosX = this.loc.x;
	this.oldPosY = this.loc.y;


}

Brush.prototype.update=function(){

	this.oldPosX=this.loc.x;
	this.oldPosY=this.loc.y;
	this.posX=int(randomGaussian()*2);
	this.posY=int(randomGaussian()*2);
	/*if (facePos){
	this.direction=createVector(randomGaussian(facePos[62][0],400)-this.oldPosX,randomGaussian(facePos[62][1],400)-this.oldPosY);
	this.acceleration=this.direction.normalize();
	
}else{*/
	
//if no emotions then normalize the acceleration if happy then add acceleration without normalizing
//console.log(emotionList);

	if (emotionList[0]==1) {
		this.acceleration.x=int(randomGaussian()*10);
	this.acceleration.y=int(randomGaussian()*10);
		limited =7;
		console.log("angry");
	} else if(emotionList[1] ==1) {
		this.acceleration.x=this.posX;
	this.acceleration.y=this.posY;
		limited =1;
console.log("sad");
	}else if(emotionList[2] ==1) {
	this.acceleration.x=int(randomGaussian()*5);
	this.acceleration.y=int(randomGaussian()*5);
		limited =5;
console.log("surprised");
	} else if(emotionList[3] ==1) {
		this.acceleration.x=this.posX;
	this.acceleration.y=this.posY;
		limited =7;
console.log("happy");
}else{
	console.log("no emotions detected");
	this.acceleration.x=this.posX;
	this.acceleration.y=this.posY;
	limited =4;
}

	this.velocity.add(this.acceleration);
	this.loc.add(this.velocity);
	this.velocity.limit(limited);
}

Brush.prototype.boundaries=function(){
	if(this.loc.x+5>width){
		this.loc.x=width-5;
		this.velocity.x*=-1;
	}else if(this.loc.x-5<0){
		this.velocity.x*=-1;
		this.loc.x=5;
	}
	if(this.loc.y+5>height){
		this.velocity.y*=-1;
		this.loc.y=height-5;
	}else if(this.loc.y-5<0){
		this.velocity.y*=-1;
		this.loc.y=5;
	}
}
Brush.prototype.displays=function(){

	//socket.emit('brush', {oldPosXU:this.oldPosX, oldPosYU:this.oldPosY, locXU:this.loc.x, locYU})
//this.pix=int(this.loc.x)+int(this.loc.y)*int(width);
this.pix = int(this.loc.y) * int(width)*4 + int(this.loc.x)*4;
// console.log("loc"+this.pix);
// console.log("R"+capture.pixels[this.pix+1]);
// console.log("g"+capture.pixels[this.pix+2]);
// console.log("b"+capture.pixels[this.pix+3]);
this.r=capture.pixels[int(this.pix)];
this.g=capture.pixels[int(this.pix+1)];
this.b=capture.pixels[int(this.pix+2)];
//this.g=green(capture.pixels[int(this.pix)]);
// this.b=blue(capture.pixels[int(this.pix)]);
stroke(this.r,this.g,this.b);
//stroke(0);


if(emotionList[3]==1){

	strokeWeight(1);
var hair=map(noise(0),0,1,3,5);
   
    push();
    translate(this.loc.x, this.loc.y);
    for (var i=0; i<8; i++) {
      line(-hair, -hair, hair, hair);
      rotate(random(0, 2*PI));
    }
    pop();

}else if(emotionList[2]==1){
	noFill();
	strokeWeight(1);
	ellipse(this.loc.x,this.loc.y,random(5,9),random(5,9));
}else{
strokeWeight(random(1,4));
line(this.oldPosX,this.oldPosY,this.loc.x,this.loc.y);
}
}



