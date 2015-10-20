function GameBoard (width,length) {
    this.width = width;
    this.length = length;

    //for game information
    this.position = [];
    this.sockets = [];
    this.name = [];
    tid.speed = [];
    this.direction = [];
    this.score = [];
    this.status = [];

    this.tolerance = 20;

    //init the game, center of the game is (0,0)

}
 

//basic fucntions including getters and setters
GameBoard.prototype.getUserPosition = function(index) {
    return this.position[index];
};

GameBoard.prototype.getUserStatus = function(index) {
	//position is stored in [...,x,y,...]
    return [this.status[index*2],this.status[index*2+1]];
};

GameBoard.prototype.getRankBoard = function() {
    //top 10
};



GameBoard.prototype.updateUserDirection = function(index, posi_x, posi_y,newDirection,io) {
    
};

GameBoard.prototype.updateUserSpeed = function(index, posi_x, posi_y,newSpeed,io) {
    //new Speed means the relative speed with its maximum speed

};

GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y,newStatus,io){
	//update user status including power ups etc
}

GameBoard.prototype.updateUserposition = function(index, posi_x, posi_y,io){
	//update user position
}

GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y,score,io){
	//update user score
}

//logic functions for validation
GameBoard.prototype.validateUserPosition = function(index, posi_x, posi_y,io) {
    //validate the information and store the information
    //if the inforamtion is not correct but in the range of tolerance, then boardcast to other users
    //要算向量，我也是醉了
};

GameBoard.prototype.userEatFood = function (index, posi_x,posi_y,food_index,io) {
	if (!GameBoard.prototype.validateUserPosition(index, posi_x, posi_y,io)){
		//validation failed
		return;
	}
	//do the eat logic

	//update Score

	//may involve powerup
};

GameBoard.prototype.userCapturing = function (index, posi_x,posi_y,user_index,io) {
	//similar to userEatFood, but need to inform the eaten user.
};

GameBoard.prototype.generateFood = function (num) {
	//generate the food
};

GameBoard.prototype.generateFullInfo = function(){
	//when the user connect, update the information to user.
};

GameBoard.prototype.addUser = function(){
	//when the user connect, update the user information.
};

//logic fucntions for maintaning the game





