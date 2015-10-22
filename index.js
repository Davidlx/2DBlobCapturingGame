var io;
var sockets = [];
var PERCENTAGE = 0.9;
io.on('connection',function(socket){
	console.log('a user connected');
	socket.on('user_name', function(name){
		socket.index = GameBoard.name.length;
		GameBoard.prototype.addUser(socket.index, io);
		socket.emit('user_index', socket.index);
	});

	socket.on('disconnect', function(index){
    	sockets.splice(index, 1);
    	GameBoard.prototype.deleteUser(index, io);

	});

	io.on('get_user_position', function(index){
		socket.emit('get user position', GameBoard.prototype.getUserPosition(index));
	});

	io.on('get_user_status', function(index){
		socket.emit('get user status', GameBoard.prototype.getUserStatus(index));
	});

	io.on('get_rank_board', function(io){
		socket.emit('get rank board', GameBoard.prototype.getRankBoard(io));
	});

	socket.on('update_user_direction', function(index, posi_x, posi_y,newDirection,io){
		GameBoard.prototype.updateUserDirection(index, posi_x, posi_y,newDirection,io);
		//emit
	});

	io.on('update_user_speed', function(index, posi_x, posi_y,newSpeed,io){
		GameBoard.prototype.updateUserSpeed(index, posi_x, posi_y,newSpeed,io);
		//emit
	});

	io.on('update_user_position', function(index, posi_x, posi_y,io){
		GameBoard.prototype.updateUserPosition(index, posi_x, posi_y,io);
		//emit
	});

	io.on('update_score', function(index, posi_x, posi_y,score,io){
		GameBoard.prototype.updateUserScore(index, posi_x, posi_y,score,io);
		//emit
	});

	socket.on('validate_user_position', function(index, posi_x, posi_y,io){
		GameBoard.prototype.validateUserPosition(index, posi_x, posi_y,io);
		//emit
	});

	socket.on('eat_food', function(index, posi_x, posi_y,io){
		GameBoard.prototype.userEatFood(index, posi_x, posi_y,io);
		//emit
	});

	socket.on('try_eat_user', function(index, posi_x,posi_y,user_index,io){
		if (GameBoard.score[index]*PERCENTAGE > GameBoard.score[user_index]){
			GameBoard.prototype.userCapturingUser(index, posi_x,posi_y,user_index,io);
			//emit
		}
		else {
			io.emit('eat_failed', index, user_index);
		}
	});



});