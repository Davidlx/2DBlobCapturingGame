function GameBoard (width,height) {
    this.width = width;
    this.height = height;

    var STATUS = ['not started','running'];
    var Default_User_Mas = 5;
    this.Default_Capture_percent = 0.5;

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
    this.timestamp = [];

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

GameBoard.prototype.updateUserDirection = function(index, posi_x, posi_y,newDirection,io,timestamp) {
    GameBoard.prototype.validateUserPosition(index, posi_x, posi_y, io);
    this.direction[index] = newDirection;

    boardcaseToAllUser(io,"update_direction",{index:index,newDirection:newDirection});
    //io.emit('update direction', index, newDirection);
};

GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y,newSpeed,io,timestamp) {
    //new Speed means the relative speed with its maximum speed
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    this.speed[index] = newSpeed;
    
    boardcaseToAllUser(io,"speed_update",{index:index,speed:newSpeed});
};

GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y,newStatus,io,timestamp){
	//update user status including power ups etc
    
    GameBoard.prototype.validateUserPosition(index, posi_x, posi_y, io);
    this.status[index] = newStatus;

    boardcaseToAllUser(io,"status_update",{index:index,status:newStatus});
}

GameBoard.prototype.updateUserPosition = function(index, posi_x, posi_y,io,timestamp){
	//update user position
    GameBoard.prototype.setTimeStamp(index,timestamp);
    this.position[index*2] = posi_x;
    this.position[index*2+1] = posi_y;
    
    boardcaseToAllUser(io,"position_update",{index:index,score:score});
}

GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y,score,io,timestamp){
	//update user score
    GameBoard.prototype.validateUserPosition(index, posi_x, posi_y, io);
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
    boardcaseToAllUser(io,"score_update",{index:index,score});
    io.emit('update score', index, score);
}


//logic functions for validation
GameBoard.prototype.validateUserPosition = function(index, posi_x, posi_y,io,timestamp) {
    //validate the information and store the information
    //if the inforamtion is not correct but in the range of tolerance, then boardcast to other users
    //要算向量，我也是醉了
    

    if (GameBoard.prototype.validatePosition(index, posi_x, posi_y,timestamp)) {
    	//normal update,should not update all the user
    	GameBoard.prototype.updateUserPosition(index, posi_x, posi_y,io);
        boardcaseToAUser(this.sockets[index],"validation_succeed",{index:index,posi_x:posi_x,posi_y:posi_y});
        boardcaseToAllUser(io,"position_update",{index:index,posi_x:posi_x,posi_y:posi_y});

        return true;
    }else{
    	//position is not right, should update all the user
    	GameBoard.prototype.updateUserPosition(index, cal_x, cal_y,io);
        boardcaseToAUser(this.sockets[index],"validation_failed",{posi_x:cal_x,posi_y:cal_y});
        return false;
    }
};

GameBoard.prototype.userEatFood = function (index, posi_x,posi_y,food_index,io,timestamp) {
    //****
	if (!GameBoard.prototype.validateUserPosition(index, posi_x, posi_y,io)){
		//validation failed
		return;
	}
	//do the eat logic

	var food_x = this.position[food_index*2];
	var food_y = this.position[food_index*2+1];
	if (Math.sqrt(Math.pow((food_x-posi_x),2)+Math.pow((food_y-posi_y),2))+1<this.score[index]) {
		//update Score
    	GameBoard.prototype.updateUserScore(index, posi_x, posi_y, this.score[index]+1, io,timestamp);
        boardcaseToAllUser(io,"food_eat",{index:index,posi_x:posi_x,posi_y:posi_y,score:this.score[index]});
	}else{
		//unable to eat
		boardcaseToAUser(this.sockets[index],"unable_to_eat",{index:index,posi_x:posi_x,posi_y:posi_y,food_x:food_x,food_y:food_y});
	}
	//may involve powerup, add later
};

GameBoard.prototype.userCapturingUser = function (index, posi_x,posi_y,user_index,io,timestamp) {
	//similar to userEatFood, but need to inform the eaten user.
    GameBoard.prototype.validateUserPosition(index, posi_x, posi_y, io);

    //calculate if the user can eat, the user's position can not be determined
    var est = GameBoard.prototype.getEstimatedPosition(index,timestamp);
    var posi__x = est[0];
    var posi__y = est[1];

    if (calculateDistance(posi_x,posi_y,posi__x,posi__y)+this.score[user_index]<=this.score[index]) {
        //validation complete, prepare to eat.
        GameBoard.prototype.resetUser(user_index,io,timestamp);
        GameBoard.prototype.updateUserScore(index,posi_x,posi_y,this.score[index]+this.Default_Capture_percent*this.score[user_index],io,timestamp);
        boardcaseToAllUser(io,"user_eat",{index:index,user_index:user_index,posi_x:posi_x,posi_y:posi_y,score:this.score[index]});
    }else{
        //failed to eat
        boardcaseToAUser(this.sockets[index],"user_eat_fail",{index:index,user_index:user_index,posi_x:posi_x,posi_y:posi_y,score:this.score[index]});
    }

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

    boardcaseToAllUser(io,"user_leave",{index:index,posi_x:posi_x,posi_y:posi_y});
    //should generate more food
};

GameBoard.prototype.resetUser = function(index, io,timestamp){
	//when the user connect, update the user information.
    var posi_x = generate_random_posi();
    var posi_y = generate_random_posi();
    GameBoard.prototype.updateUserPosition(index, RANDOM_X, RANDOM_Y, io);
    GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y, 0, io);
    GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y, this.Default_User_Mas, io);
    GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y, this.STATUS[0], io);

    boardcaseToAllUser(io,"user_reset",{index:index,posi_x:posi_x,posi_y:posi_y,score:this.Default_User_Mas});
};

GameBoard.prototype.generateFood = function (num,timestamp) {
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
        this.timestamp.push(timestamp);
        index = this.status.length-1;

        boardcaseToAllUser(io,"food_add",{index:index,posi_x:posi_x,posi_y:posi_y});
    };
};

GameBoard.prototype.generateFullInfo = function(){
	//when the user connect, update the information to user.
    //****
};

GameBoard.prototype.addUser = function(username,socket,timestamp){
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
    this.timestamp.push(timestamp);
    index = this.status.length-1;

    //more info
    boardcaseToAllUser(io,"User_Add",{index:index,posi_x:posi_x,posi_y:posi_y,name:username,});
};

GameBoard.prototype.activateUser = function(index,timestamp,io){
    this.status.push(this.STATUS[1]);
    this.timestamp.push(timestamp);

    boardcaseToAllUser(io,"User_Activation",{index:index});
}



//private functions
GameBoard.prototype.getTimeStamp = function(index){
    return this.timestamp[index];
};

GameBoard.prototype.getEstimatedPosition = function(index,timestamp){
    cur_x = this.position[index*2];
    cur_y = this.position[index*2+1];
    last_timestamp = this.timestamp[index];

    time_diff = timestamp - last_timestamp;

    est_x = cur_x + this.speed[index]*cos(this.direction[index]);
    est_y = cur_y + this.speed[index]*sin(this.direction[index]);

    if (est_x<-this.width/2) {
        est_x = -this.width/2;
    }else if (est_x>this.width/2){
        est_x = this.width/2;
    }

    if (est_y<-this.height/2) {
        est_y = -this.height/2;
    }else if (est_y>this.height/2) {
        est_y = this.height/2;
    }

    return [est_x,est_y];
}

GameBoard.prototype.validatePosition = function(index,timestamp,posi_x,posi_y){
    if (posi_x<-this.width/2||posi_x>this.width/2||posi_y<-this.height/2||posi_y>this.height/2) {
        return false;
    }

    var est = GameBoard.prototype.getEstimatedPosition(index,timestamp);

    if (Math.sqrt(Math.pow((est[0]-posi_x),2)+Math.pow((est[1]-posi_y),2))<=this.tolerance) {
        return true;
    }else{
        return false;
    }
}


GameBoard.prototype.setTimeStamp = function(index,timestamp){
    this.timestamp[index] = timestamp;
};


function calculateDistance(x,y,X,Y){
    return Math.sqrt(Math.pow((X-x),2)+Math.pow((Y-y),2));
}

function boardcaseToAllUser(io,tag,para){
    io.emit(tag,para);
}

function boardcaseToAUser(socket,tag,para){
    socket.emit(tag,para);
}
