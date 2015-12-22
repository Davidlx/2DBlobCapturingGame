var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var Gameboard = require('./GameBoard.js');
var gameboard = new Gameboard(10240,10240);

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
		//should send all the information to user
	});

	socket.on('disconnect', function(index){
		//delete user? or reconnect? or make the user invisiable and when it reconnect, user can start from where he left?
    	sockets.splice(index, 1);
    	gameboard.deleteUser(index, io);
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

	socket.on('regular_updates', function(index, posi_x, posi_y,timestamp){
		console.log(" ");
		console.log("regular_updates");
		gameboard.validateUserPosition(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('eat_food', function(index, posi_x, posi_y,io,timestamp){
		gameboard.userEatFood(index, posi_x, posi_y,io,timestamp);
		//emit
	});

	socket.on('eat_user', function(index, posi_x,posi_y,user_index,io,timestamp){
		gameboard.userCapturingUser(index, posi_x,posi_y,user_index,io,timestamp);
	});
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

function getUNIXTimestamp(){
	return Math.floor(Date.now());
}