function GameBoard (width,length) {
    this.width = width;
    this.length = length;

    var STATUS = ['not started','running'];

    //for game information
    this.position = [];
    this.sockets = [];
    this.name = [];
    this.speed = [];
    this.direction = [];
    this.score = [];
    this.status = [];

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

GameBoard.prototype.getRankBoard = function() {
    //top 10
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
    io.emit('update score', index, score);
}


//logic functions for validation
GameBoard.prototype.validateUserPosition = function(index, posi_x, posi_y,io) {
    //validate the information and store the information
    //if the inforamtion is not correct but in the range of tolerance, then boardcast to other users
    //要算向量，我也是醉了
};

GameBoard.prototype.userEatFood = function (index, posi_x,posi_y,food_index,io) {
    //****
	if (!GameBoard.prototype.validateUserPosition(index, posi_x, posi_y,io)){
		//validation failed
        io.emit('validation failed', index);
		return;
	}
	//do the eat logic

    //if not powerup
    if (food_index!=0){
        GameBoard.prototype.updateUserStatus(index, posi_x,posi_y, food_index, io);
    }
	//update Score
    GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y, this.score[index]+1, io);
	//may involve powerup
};

GameBoard.prototype.userCapturingUser = function (index, posi_x,posi_y,user_index,io) {
	//similar to userEatFood, but need to inform the eaten user.
    GameBoard.prototype.updateUserPosition(index, posi_x, posi_y, io);
    GameBoard.prototype.updateUserScore(index, posi_x, posi_y, this.score[user_index]/2, io);

};



//logic fucntions for maintaning the game

GameBoard.prototype.deleteUser = function(index, io){
	//when the user connect, update the user information.
    //****
};

GameBoard.prototype.resetUser = function(index, io){
	//when the user connect, update the user information.
    var posi_x = generate_random_posi();
    var posi_y = generate_random_posi();
    GameBoard.prototype.updateUserPosition(index, RANDOM_X, RANDOM_Y, io)
    GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y, INITIAL_SPEED, io)
    GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y, 0, io)
    GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y, INITIAL_STATUS, io)
};

GameBoard.prototype.generateFood = function (num) {
	//generate the food
    //****
};

GameBoard.prototype.generateFullInfo = function(){
	//when the user connect, update the information to user.
    //****
};

GameBoard.prototype.addUser = function(){
	//when the user connect, update the user information.
    //****
};