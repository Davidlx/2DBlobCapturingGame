function GameBoard (width,height) {
    this.width = width;
    this.height = height;

    var STATUS = ['not started','running'];
    var Default_User_Mas = 5;
    var Default_Capture_percent = 0.5;

    //for game information
    this.position = [];
    this.sockets = [];
    this.name = [];
    this.speed = [];
    //in redians
    this.direction = [];
    this.score = [];
    this.status = [];
    this.rankBoard = [];

    this.tolerance = 20;

    //init the game, center of the game is (0,0)

}
 

//basic fucntions including getters and setters
GameBoard.prototype.getUserPosition = function(index) {
    return [this.position[index*2],this.position[index*2+1]];
};

GameBoard.prototype.getUserStatus = function(index) {
	//position is stored in [...,x,y,...]
    return this.status[index];
};

GameBoard.prototype.getUserScore = function(index) {
	//position is stored in [...,x,y,...]
    return this.score[index];
};

GameBoard.prototype.getRankBoard = function() {
    //top 10
    return rankBoard;
};

GameBoard.prototype.updateUserDirection = function(index, posi_x, posi_y,newDirection,io) {
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    this.direction[index] = newDirection;
    io.emit('update direction', index, newDirection);
};

GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y,newSpeed,io) {
    //new Speed means the relative speed with its maximum speed
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    this.speed[index] = newSpeed;
    io.emit('update speed', index, newSpeed);
};

GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y,newStatus,io){
	//update user status including power ups etc
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    this.status[index] = newStatus;
    io.emit('update statue', index, newStatus);
}

GameBoard.prototype.updateUserPosition = function(index, posi_x, posi_y,io){
	//update user position
    this.position[index*2] = posi_x;
    this.position[index*2+1] = posi_y;
    io.emit('update position', index, posi_x, posi_y);
}

GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y,score,io){
	//update user score
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    this.score[index] = score;
    //update rank board
    if (this.rankBoard.length<10) {
    	this.rankBoard.push(index);
    }else{
    	if (GameBoard.prototype.getUserScore(this.rankBoard[9])<=score) {
    		for (var i = this.rankBoard.length - 1; i >= 0; i--) {
    			if (GameBoard.prototype.getUserScore(this.rankBoard[i])<=score) {
    				break;
    			}
    		};
    		for (var m = this.rankBoard.length - 1; m > i; m--) {
    			this.rankBoard[m] = this.rankBoard[m-1];
    		};
    		this.rankBoard[i] = index;
    	}
    }
    io.emit('update score', index, score);
}


//logic functions for validation
GameBoard.prototype.validateUserPosition = function(index, posi_x, posi_y,io) {
    //validate the information and store the information
    //if the inforamtion is not correct but in the range of tolerance, then boardcast to other users
    //要算向量，我也是醉了
    var cal_x = this.position[index*2]+this.speed[index]*cos(this.direction);
    var cal_y = this.position[index*2+1]+this.speed[index]*sin(this.direction);

    if (-this.width/2>cal_x) {
    	cal_x = -this.width/2;
    }
    if (cal_x>this.width/2) {
    	cal_x = this.width/2;
    }

    if (-this.height/2>cal_y) {
    	cal_y = -this.height/2;
    }
    if (cal_y>this.height/2) {
    	cal_y = this.height/2;
    }

    if (Math.sqrt(Math.pow((cal_x-posi_x),2)+Math.pow((cal_y-posi_y)^2),2))<this.tolerance||!(-this.width/2<=posi_x<=this.width/2)||!(-this.height/2<=posi_y<=this.height/2)) {
    	//normal update,should not update all the user
    	GameBoard.prototype.updateUserPosition(index, posi_x, posi_y,io);
    }else{
    	//position is not right, should update all the user
    	GameBoard.prototype.updateUserPosition(index, cal_x, cal_y,io);
    }
};

GameBoard.prototype.userEatFood = function (index, posi_x,posi_y,food_index,io) {
    //****
	if (!GameBoard.prototype.validateUserPosition(index, posi_x, posi_y,io)){
		//validation failed
        io.emit('validation failed', index);
		return;
	}
	//do the eat logic
	var food_x = this.position[food_index*2];
	var food_y = this.position[food_index*2+1];
	if (Math.sqrt(Math.pow((food_x-posi_x),2)+Math.pow((food_y-posi_y),2))+1<this.score[index]) {
		//update Score
    	GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y, this.score[index]+1, io);
	}else{
		//unable to eat
		this.sockets[index].emit('unable to eat');
	}
	//may involve powerup, add later
};

GameBoard.prototype.userCapturingUser = function (index, posi_x,posi_y,user_index,io) {
	//similar to userEatFood, but need to inform the eaten user.
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);

    //calculate if the user can eat, the user's position can not be determined

    //when the user can eat

    GameBoard.prototype.updateUserScore(index, posi_x, posi_y, this.score[user_index]*Default_Capture_percent, io);
    GameBoard.prototype.resetUser(user_index,this.sockets[user_index]);

};



//logic fucntions for maintaning the game

GameBoard.prototype.deleteUser = function(index, io){
	this.position.splice(index,1);
    this.sockets.splice(index,1);
    this.name.splice(index,1);
    this.speed.splice(index,1);
    this.direction.splice(index,1);
    this.score.splice(index,1);
    this.status.splice(index,1);

    io.emit('user leave', index, posi_x, posi_y);
};

GameBoard.prototype.resetUser = function(index, io){
	//when the user connect, update the user information.
    var posi_x = generate_random_posi();
    var posi_y = generate_random_posi();
    GameBoard.prototype.updateUserPosition(index, RANDOM_X, RANDOM_Y, io)
    GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y, 0, io)
    GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y, 0, io)
    GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y, this.STATUS[0], io)
};

GameBoard.prototype.generateFood = function (num) {
	//generate the food
    //****
    var posi_x = generate_random_posi();
    var posi_y = generate_random_posi();
    for (var i = num; i >= 0; i--) {
    	this.position.push(posi_x);
    	this.position.push(posi_y);
	    this.sockets.push(null);
	    this.name.push(null);
	    this.speed.push(0);
	    this.direction.push(0);
	    this.score.push(1);
	    this.status.push(this.STATUS[1]);
    };
};

GameBoard.prototype.generateFullInfo = function(){
	//when the user connect, update the information to user.
    //****
};

GameBoard.prototype.addUser = function(username,socket){
	//when the user connect, update the user information.
    //****
    //****
    var posi_x = generate_random_posi();
    var posi_y = generate_random_posi();
    this.position.push(posi_x);
	this.position.push(posi_y);
    this.sockets.push(socket);
    this.name.push(username);
    this.speed.push(0);
    this.direction.push(0);
    this.score.push(Default_User_Mas);
    this.status.push(this.STATUS[0]);
};