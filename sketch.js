 
var capture;
var movers=[];
var tracker;
var facePos;
var users=[];

	// var socket = io.connect('http://45.55.48.195:8080/');

	// socket.on('connect', function() {
	// 	console.log("Connected");

	// 			//socket.emit('hello',"blah blahb blah");
	// 			//console.log("sent hello");

	// 		});

	// socket.on('goodbye',function(data) {
	// 	console.log("Server said goodbye: " + data);
	// });


function setup() {
  	//createCanvas(windowWidth, windowHeight);
  	background(255);

  	capture = createCapture({
  		video: {
  			mandatory: {
  				minWidth: 320,
  				minHeight: 180
  			}
  		}
  	});
  	createCanvas(320, 180);
  	//console.log("sia"+capture.size)
  	capture.size(320, 180);
  	capture.id('myFace');
  	console.log(select('#myFace'));
  	capture.hide();
	tracker = new clm.tracker();
	tracker.init(pModel);
	tracker.start(capture.elt);
  	for (var i=0; i<50; i++) {
  		movers.push(new Brush());
  	}
  }

  function draw() {
background(255,20);
  	capture.loadPixels();
  	if(capture.pixels!=0){
facePos = tracker.getCurrentPosition();
//console.log("middle of your face x:"+ facePos[62][0]+", y:"+facePos[62][1])
  //console.log(capture.pixels.length);
  //loadPixels();
  //image(capture, 0, 0,width, height);
  //filter('INVERT');
  for (var i=0; i<movers.length; i++) {
  	movers[i].update();
  	movers[i].boundaries();
	//console.log(movers[i].loc,movers[i].posX,movers[i].oldPosX);
// 	movers[i].pix=int(movers[i].loc.x)+int(movers[i].loc.y)*width;

// var r=capture.pixels[int(movers[i].pix)*4];
// var g=capture.pixels[(int(movers[i].pix)+1)*4];
// var b=capture.pixels[(int(movers[i].pix)+2)*4];
// stroke(r,g,b);
// strokeWeight(random(5,10));

movers[i].displays();

}
}
}

var Brush = function(){
	this.posX=0;
	this.posY=0;
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
	this.acceleration.x=this.posX;
	this.acceleration.y=this.posY;
//if no emotions then normalize the acceleration if happy then add acceleration without normalizing
	this.velocity.add(this.acceleration);
	this.loc.add(this.velocity);
	this.velocity.limit(5);
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
this.pix = int(this.loc.y) * int(capture.width)*4 + int(this.loc.x)*4;
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
strokeWeight(random(1,4));
line(this.oldPosX,this.oldPosY,this.loc.x,this.loc.y);

}

