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
var AI_STARTLED_DISTANCE = 250;
var AI_Interval_ID = [];
var AI_Interval_Move_ID = [];

// Redirect to client repository
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

	socket.on('eat_user', function(index, posi_x,posi_y,user_index,scale1,scale2,timestamp){
		gameboard.userCapturingUser(index, posi_x,posi_y,user_index,scale1,scale2,io,timestamp);
	});

  socket.on('update_scale', function(index, scale, timestamp){
    gameboard.updateScale(index, scale, io, timestamp);
  });

  setInterval(function() {
    //console.log("update all user location");
    gameboard.updateAllUserLocation(io);
  }, 35);

});


// AI functions, to simulate the AI agent movements
function addAI(io){
	var AICounter=0;
	for(var i=0; i<gameboard.status.length; i++){
		if (gameboard.status[i]==gameboard.statusType[2]){
			AICounter++;
		}
	}
	if(AICounter==0){
		gameboard.sockets.push(0);
		gameboard.name.push("");
		gameboard.speed.push(0);
		gameboard.score.push(0);
		gameboard.status.push(gameboard.statusType[2]);
		gameboard.direction.push(0);
		gameboard.position.push(Math.round(Math.random()*MAP_SIZE));
		gameboard.position.push(Math.round(Math.random()*MAP_SIZE));
		AIIndex = gameboard.name.length-1;
		gameboard.activeUserID.push(AIIndex);
		io.emit("User_Add",{index:AIIndex,posi_x:gameboard.position[AIIndex*2],posi_y:gameboard.position[AIIndex*2+1],name:gameboard.name[AIIndex], ai:true});
		runAI(AIIndex,io);
	}
}

function runAI(index,io){
	gameboard.name[index] = "";
	gameboard.speed[index] = 3;
	gameboard.score[index] = 10;
	gameboard.status[index] = gameboard.statusType[2];
	gameboard.direction[index] = 0;

	var nearestUserIndex = -1;

	var temp_ID = setInterval(function () {
		if(gameboard.activeUserID.length>0){
			var para = userDetection(index);
			nearestUserIndex = para.userIndex;
			if(para.userNearby) AIStartled = true;
			else AIStartled = false;
		}
		if(AIStartled){
			//speed up
			gameboard.speed[index] =2.8;
			//run away from users
			gameboard.direction[index] = runAwayFromUsers(index,nearestUserIndex);
		}
		else{
			//reset speed to unstartled situation
			gameboard.speed[index] = 1.5;
			//wandering...
			gameboard.direction[index] = (Math.random()-0.5)*2*Math.PI;
		}
	},1000);

  AI_Interval_ID[index] = temp_ID;

	temp_ID = setInterval(function () {
		AIMove(index, gameboard.speed[index], gameboard.direction[index]);
    }, gameboard.REGULAR_UPDATES_RATE);

    AI_Interval_Move_ID[index] = temp_ID;

    temp_ID = setInterval(function () {
  		if(gameboard.status[index] == gameboard.statusType[1]){
        deleteAI(index,io);
        clearInterval(temp_ID);
      }
    }, gameboard.REGULAR_UPDATES_RATE);


}

function userDetection(index){
	var isNearby = false;
	var nearestUserIndex;
	var nearestDistance = AI_STARTLED_DISTANCE;
	var dist;
	for(var i=0;i<gameboard.activeUserID.length;i++){
		if(gameboard.activeUserID[i]!=index){
			dist = calDistance(gameboard.position[index*2],gameboard.position[index*2+1],gameboard.position[gameboard.activeUserID[i]*2],gameboard.position[gameboard.activeUserID[i]*2+1]);
			if(dist<AI_STARTLED_DISTANCE && dist<nearestDistance){
				nearestDistance = dist;
				nearestUserIndex = gameboard.activeUserID[i];
				isNearby = true;
			}
		}
	}
	return {userNearby:isNearby, userIndex: nearestUserIndex};
}

function calDistance(ax,ay,bx,by){
	return Math.pow((Math.pow(ax-bx,2)+Math.pow(ay-by,2)),0.5);
}


function calAngle(ax,ay,bx,by){
	return Math.atan2(by-ay,bx-ax);
}

function runAwayFromUsers(index,nearestUserIndex){
	var angle = calAngle(gameboard.position[index*2],gameboard.position[index*2+1],gameboard.position[nearestUserIndex*2],gameboard.position[nearestUserIndex*2+1]);
	var op_direc = angle - Math.PI;
	if(op_direc< -Math.PI){
		op_direc += 2 * Math.PI;
	}

  if (towardsWall(index,op_direc)) {
    //escape from the wall
    if (gameboard.position[index*2]<50 && (op_direc>(Math.PI/2)||op_direc<(-Math.PI/2))) {
      console.log("towards left");
      return 0;

    }else if (gameboard.position[index*2]>(gameboard.width-50) && ((op_direc<(Math.PI/2) && op_direc > 0) || op_direc > (-Math.PI/2))) {
      console.log("towards Right");
      return -Math.PI;
    }else if (gameboard.position[index*2+1]<50 && op_direc < 0) {
      console.log("towards bottom");
      return Math.PI/2;
    }else if (gameboard.position[index*2+1]>(gameboard.height-50) && op_direc > 0) {
      console.log("towards top");
      return -Math.PI/2;;
    }
  }

	return op_direc;
}

function towardsWall(index,op_direc){
  if (gameboard.position[index*2]<50 && (op_direc>(Math.PI/2)||op_direc<(-Math.PI/2))) {
    return true;
  }else if (gameboard.position[index*2]>(gameboard.width-50) && ((op_direc<(Math.PI/2) && op_direc > 0) || op_direc > (-Math.PI/2))) {
    return true;
  }else if (gameboard.position[index*2+1]<50 && op_direc < 0) {
    return true;
  }else if (gameboard.position[index*2+1]<50 && op_direc > 0) {
    return true;
  }
  return false;
}

//input: angle_c, a, b
//output: angle_ACD, 2*d
function calVector(angle,a,b){
	var c = Math.pow((Math.pow(a,2)+Math.pow(b,2)-2*a*b*Math.cos(angle)),0.5);
	var angle_a = (Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c);
	var d = Math.pow((Math.pow(b,2)+Math.pow(0.5*c,2)-2*b*0.5*c*Math.cos(angle_a)),0.5);

	var v_angle = Math.acos((Math.pow(b,2)+Math.pow(d,2)-Math(0.5*c,2))/(2*b*d));
	var v_length = 2*d;
	return v_angle;
}

function AIMove(index, speed, angle){
	var isLeft = true;
    var isRight = true;
    var isUp = true;
    var isDown = true;
    var y = Math.sin(angle);
    var x = Math.cos(angle);

    if(gameboard.position[index*2]<10) isLeft = false;
    else isLeft = true;
    if(gameboard.position[index*2]>gameboard.width-10) isRight = false;
    else isRight = true;
    if(gameboard.position[index*2+1]<10) isDown = false;
    else isDown = true;
    if(gameboard.position[index*2+1]>gameboard.height-10) isUp = false;
    else isUp = true;

    if(x>0){
        if(isRight) gameboard.position[index*2] += speed * x;
        if(y>0){
            if(isUp) gameboard.position[index*2+1] += speed * y;
        }else{
            if(isDown) gameboard.position[index*2+1] += speed * y;
        }
    }else {
        if(isLeft) gameboard.position[index*2] += speed * x;
        if(y>0){
            if(isUp) gameboard.position[index*2+1] += speed * y;
        }else{
            if(isDown) gameboard.position[index*2+1] += speed * y;
        }
    }
}

function deleteAI(index,io){
	//TODO: stop AI ruuning

  clearInterval(AI_Interval_ID[index]);
  clearInterval(AI_Interval_Move_ID[index]);
	io.emit("user_leave",{index:index});
  addAI(io);
}

// Start the server to listen to port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});
