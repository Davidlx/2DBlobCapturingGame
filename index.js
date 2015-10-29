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
	socket.on('user name', function(name){
		console.log(name);
		gameboard.addUser(name,socket, Date.now(),io);
		socket.index = gameboard.name.length;
		socket.emit('user_index', socket.index);
	});

	socket.on('disconnect', function(index){
    	sockets.splice(index, 1);
    	gameboard.deleteUser(index, io);
	});

	io.on('get_user_position', function(index){
		socket.emit('get user position', gameboard.getUserPosition(index));
	});

	io.on('get_user_status', function(index){
		socket.emit('get user status', gameboard.getUserStatus(index));
	});

	io.on('get_rank_board', function(io){
		socket.emit('get rank board', gameboard.getRankBoard(io));
	});

	socket.on('update_user_direction', function(index, posi_x, posi_y,newDirection,io){
		gameboard.updateUserDirection(index, posi_x, posi_y,newDirection,io);
		//emit
	});

	io.on('update_user_speed', function(index, posi_x, posi_y,newSpeed,io){
		gameboard.updateUserSpeed(index, posi_x, posi_y,newSpeed,io);
		//emit
	});

	io.on('update_user_position', function(index, posi_x, posi_y,io){
		gameboard.updateUserPosition(index, posi_x, posi_y,io);
		//emit
	});

	io.on('update_score', function(index, posi_x, posi_y,score,io){
		gameboard.updateUserScore(index, posi_x, posi_y,score,io);
		//emit
	});

	socket.on('validate_user_position', function(index, posi_x, posi_y,io){
		gameboard.validateUserPosition(index, posi_x, posi_y,io);
		//emit
	});

	socket.on('eat_food', function(index, posi_x, posi_y,io){
		gameboard.userEatFood(index, posi_x, posi_y,io);
		//emit
	});

	socket.on('try_eat_user', function(index, posi_x,posi_y,user_index,io){
		if (GameBoard.score[index]*PERCENTAGE > GameBoard.score[user_index]){
			gameboard.userCapturingUser(index, posi_x,posi_y,user_index,io);
			//emit
		}
		else {
			io.emit('eat_failed', index, user_index);
		}
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});