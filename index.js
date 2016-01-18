var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var Gameboard = require('./GameBoard.js');
var gameboard = new Gameboard(1600,1600);

var sockets = [];
var PERCENTAGE = 0.9;

app.use(express.static(path.join(__dirname,'../2DBlobClient/game')));

app.get('/', function(req, res){
  res.sendfile('/index.html');
});

io.on('connection',function(socket){
	console.log('a user connected');



	socket.on('user_name', function(name,timestamp){
		//new user added
		console.log(name);
		gameboard.addUser(name,socket,timestamp,io);
		socket.index = gameboard.name.length-1;
		socket.emit('user_index', socket.index);
		//socket.emit('user_initial_position', gameboard.position[index*2], gameboard.position[index*2+1]);
		//should send all the information to user
		socket.emit('user_initial_position',100,100);
	});

	socket.on('disconnect', function(index){
		//delete user? or reconnect? or make the user invisiable and when it reconnect, user can start from where he left?
    	gameboard.deleteUser(index, io);
    	console.log("A user has left");
	});

	//rank board will be updated by the system interms of events
	// io.on('get_rank_board', function(io){
	// 	socket.emit('get rank board', gameboard.getRankBoard(io));
	// });

	socket.on('update_user_direction', function(index, posi_x, posi_y,newDirection,timestamp){
		console.log(" ");
		console.log("update_user_direction");
		gameboard.updateUserDirection(index, posi_x, posi_y,newDirection,io,timestamp);
		//emit
	});

	socket.on('update_user_speed', function(index, posi_x, posi_y,newSpeed,timestamp){
		console.log(" ");
		console.log("update_user_speed");
		gameboard.updateUserSpeed(index, posi_x, posi_y,newSpeed,io,timestamp);
		//emit
	});

	socket.on('update_user_position', function(index, posi_x, posi_y,timestamp){
		gameboard.updateUserPosition(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('regular_updates', function(index, posi_x, posi_y,timestamp){
		console.log(" ");
		console.log("regular_updates");
		gameboard.validateUserPosition(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('food_eat', function(index, posi_x, posi_y,food_index,timestamp){
		gameboard.userEatFood(index, posi_x, posi_y,food_index,io,timestamp);
		//emit
	});

	socket.on('eat_user', function(index, posi_x,posi_y,user_index,timestamp){
		console.log("User Eat Received");
		gameboard.userCapturingUser(index, posi_x,posi_y,user_index,io,timestamp);
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
