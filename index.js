var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gameboard = require('./GameBoard.js');
var gameboard = new Gameboard(1024,1024);

var sockets = [];
var PERCENTAGE = 0.9;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection',function(socket){
	console.log('a user connected');
	socket.on('user_name', function(name){
		//new user added
		console.log(name);
		gameboard.addUser(name,socket, Date.now(),io);
		socket.index = gameboard.name.length;
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

	socket.on('update_user_direction', function(index, posi_x, posi_y,newDirection){
		gameboard.updateUserDirection(index, posi_x, posi_y,newDirection,io,Date.now());
		//emit
	});

	io.on('update_user_speed', function(index, posi_x, posi_y,newSpeed){
		gameboard.updateUserSpeed(index, posi_x, posi_y,newSpeed,io,Date.now());
		//emit
	});

	io.on('update_user_position', function(index, posi_x, posi_y){
		gameboard.updateUserPosition(index, posi_x, posi_y,io,Date.now());
		//emit
	});

	socket.on('regular_updates', function(index, posi_x, posi_y){
		gameboard.validateUserPosition(index, posi_x, posi_y,io,Date.now());
		//emit
	});

	socket.on('eat_food', function(index, posi_x, posi_y,io){
		gameboard.userEatFood(index, posi_x, posi_y,io,Date.now());
		//emit
	});

	socket.on('eat_user', function(index, posi_x,posi_y,user_index,io){
		gameboard.userCapturingUser(index, posi_x,posi_y,user_index,io,Date.now());
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
