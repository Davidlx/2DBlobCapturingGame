var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var Gameboard = require('./GameBoard.js');

var MAP_SIZE = 1600;
var gameboard = new Gameboard(MAP_SIZE,MAP_SIZE);

var sockets = [];
var PERCENTAGE = 0.9;

var AIStartled = false;
var AI_STARTLED_DISTANCE = 150;

app.use(express.static(path.join(__dirname,'../2DBlobClient/game')));

app.get('/', function(req, res){
  res.sendfile('/index.html');
});

io.on('connection',function(socket){
	console.log('a user connected');

	addAI(io);
	socket.on('user_name', function(name,timestamp){
		//new user added
		gameboard.addUser(name,socket,timestamp,io);
		socket.index = gameboard.name.length-1;
		socket.emit('user_index', socket.index);
		//socket.emit('user_initial_position', gameboard.position[index*2], gameboard.position[index*2+1]);
		//should send all the information to user
		socket.emit('user_initial_position',Math.round(Math.random()*MAP_SIZE),Math.round(Math.random()*MAP_SIZE));
	});

	socket.on('disconnect', function(){
		//delete user? or reconnect? or make the user invisiable and when it reconnect, user can start from where he left?
		gameboard.userDisconnect(socket,io);
    	console.log("A user has left");
	});

	socket.on('update_user_position', function(index, posi_x, posi_y,timestamp){
		gameboard.updateUserPosition(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('regular_updates', function(index, posi_x, posi_y,timestamp){
		gameboard.validateUserPosition(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('food_eat', function(index, posi_x, posi_y,food_index,timestamp){
		gameboard.userEatFood(index, posi_x, posi_y,food_index,io,timestamp);
		//emit
	});

	socket.on('eat_user', function(index, posi_x,posi_y,user_index,timestamp){
		gameboard.userCapturingUser(index, posi_x,posi_y,user_index,io,timestamp);
	});

  setInterval(function() {
    //console.log("update all user location");
    gameboard.updateAllUserLocation(io);
  }, 35);

});

function addAI(io){
	var userCounter=0;
	for(var i=0; i<gameboard.status.length; i++){
		if (gameboard.status[i]==gameboard.statusType[0]){
			userCounter++;
		}
	}
	if(userCounter<=5){
		gameboard.sockets.push(0);
		gameboard.name.push("AI");
		gameboard.speed.push(0);
		gameboard.score.push(0);
		gameboard.status.push("");
		gameboard.direction.push(0);
		gameboard.position.push(200);
		gameboard.position.push(200);
		AIIndex = gameboard.name.length-1;
		gameboard.activeUserID.push(AIIndex);
		io.emit("User_Add",{index:AIIndex,posi_x:gameboard.position[AIIndex*2],posi_y:gameboard.position[AIIndex*2+1],name:gameboard.name[AIIndex]});
		runAI(AIIndex,io);
	}
}

function runAI(index,io){
	gameboard.name[index] = "AI";
	gameboard.speed[index] = 3;
	gameboard.score[index] = 10;
	gameboard.status[index] = gameboard.statusType[0];
	gameboard.direction[index] = 0;

	var nearbyUserIndices = [];

	setInterval(function () {
		var para = userDetection(index);
		nearbyUserIndices = para.userIndices;
		if(para.userNearby) AIStartled = true;
		else AIStartled = false;
	},1000);

	setInterval(function () {
		if(AIStartled){
			//speed up
			gameboard.speed[index] =2;
			//run away from users
			gameboard.direction[index] = runAwayFromUsers(index,nearbyUserIndices);
		}
		else{
			//reset speed to unstartled situation
			gameboard.speed[index] = 0.5;
			//wandering...
			gameboard.direction[index] = Math.round((Math.random()-0.5)*2*Math.PI);
			
		}
    }, 1000);

	setInterval(function () {
		gameboard.AIMove(index, gameboard.speed[index], gameboard.direction[index]);
    }, gameboard.REGULAR_UPDATES_RATE);
}

function userDetection(index){
	//gameboard.activeUserID[];
	var isNearby = false;
	var nearbyUserIndices = [];
	var k=0;
	for(var i=0;i<gameboard.activeUserID.length;i++){
		if(calDistance(gameboard.position[index*2],gameboard.position[index*2+1],gameboard.position[gameboard.activeUserID[i]*2],gameboard.position[gameboard.activeUserID[i]*2+1])<AI_STARTLED_DISTANCE){
			nearbyUserIndices[k] = gameboard.activeUserID[i];
			k++;
			isNearby = true;
		}
	}
	return {userNearby:isNearby, userIndices: nearbyUserIndices};
}

function calDistance(ax,ay,bx,by){
	return Math.pow((Math.pow(ax-bx,2)+Math.pow(ay-by,2)),0.5);
}

function runAwayFromUsers(inedx,userIndices){

}

function AIMove(index, speed, angle){
	var isLeft = true;
    var isRight = true;
    var isUp = true;
    var isDown = true;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);

    if(this.position[index*2]<10) isLeft = false;
    else isLeft = true;
    if(this.position[index*2]>this.width-10) isRight = false;
    else isRight = true;
    if(this.position[index*2+1]<10) isDown = false;
    else isDown = true;
    if(this.position[index*2+1]>this.height-10) isUp = false;
    else isUp = true;

    if(cos<0){
        if(isRight) this.position[index*2] -= speed * cos;
        if(sin<0){
            if(isUp) this.position[index*2+1] -= speed * sin;
        }else{
            if(isDown) this.position[index*2+1] -= speed * sin;
        }
    }else {
        if(isLeft) this.position[index*2] -= speed * cos;
        if(sin<0){
            if(isUp) this.position[index*2+1] -= speed * sin;
        }else{
            if(isDown) this.position[index*2+1] -= speed * sin;
        }
    }
}

function deleteAI(index,io){
	//TODO: stop AI ruuning


	io.emit("user_leave",{index:index});
}


http.listen(3000, function(){
  console.log('listening on *:3000');
});
