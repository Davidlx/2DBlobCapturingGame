module.exports = GameBoard;

var io = require('socket.io');
function GameBoard (width,height) {
    this.width = width;
    this.height = height;
    this.io = io;
    this.statusType = ['running','not started'];
    this.Default_User_Mas = 10;
    this.Default_Capture_percent = 0.5;
    this.REGULAR_UPDATES_RATE = 15;

    //for game information
    this.position = new Array();
    this.sockets = [];
    this.name = [];
    this.speed = [];
    //in redians
    this.direction = []; //do NOT delete this line!!(AI needs it)
    this.score = [];
    this.status = [];
    this.rankBoard = [];
    this.timestamp = [];
    this.food_posi = [];
    this.food_type = [];

    this.tolerance = 20;
    this.activeUserID = new Array();

    //init the game, center of the game is (0,0)
    this.generateFoods(50,getUNIXTimestamp());
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

GameBoard.prototype.updateUserStatus = function(index, posi_x, posi_y,newStatus,io,timestamp){
	//update user status including power ups etc

    this.validateUserPosition(index, posi_x, posi_y, io);
    this.status[index] = newStatus;

    boardcastToAllUser(io,"status_update",{index:index,status:newStatus});
}

GameBoard.prototype.updateUserPosition = function(index, posi_x, posi_y,io,timestamp){
	//update user position
    this.setTimeStamp(index,timestamp);
    this.position[index*2] = posi_x;
    this.position[index*2+1] = posi_y;

    boardcastToAllUser(io,"position_update",{index:index,posi_x:posi_x,posi_y:posi_y});
}

GameBoard.prototype.updateUserScore = function(index, posi_x, posi_y,score,io,timestamp){
	//update user score
    this.validateUserPosition(index, posi_x, posi_y, io,timestamp);
    this.score[index] = score;
    //update rank board
    if (this.rankBoard.length<10) {
    	this.rankBoard.push(index);
    }else{
    	if (this.getUserScore(this.rankBoard[9])<=score) {
    		for (var i = this.rankBoard.length - 1; i >= 0; i--) {
    			if (this.getUserScore(this.rankBoard[i])<=score) {
    				break;
    			}
    		};
    		for (var m = this.rankBoard.length - 1; m > i; m--) {
    			this.rankBoard[m] = this.rankBoard[m-1];
    		};
    		this.rankBoard[i] = index;
    	}
    }
    boardcastToAllUser(io,"score_update",{index:index,score:score});
    io.emit('update score', index, score);
}


//logic functions for validation
GameBoard.prototype.validateUserPosition = function(index, posi_x, posi_y,io,timestamp) {
    this.updateUserPosition(index, posi_x, posi_y,io,timestamp);
    return true;
};

GameBoard.prototype.userEatFood = function (index, posi_x,posi_y,food_index,io,timestamp) {
    //****
    LowLog("User eat food: "+this.food_posi[food_index*2]+" "+this.food_posi[food_index*2+1]+" user: "+this.position[index*2]+" "+this.position[index*2+1]);
	if (!this.validateUserPosition(index, posi_x, posi_y,io,timestamp)){
		//validation failed
        boardcastToAUser(this.sockets[index],"food_eat_fail",{index:index,posi_x:posi_x,posi_y:posi_y,food_index: food_index});
        HighLog("Eat food failed due to position validation failed");
		return;
	}
	//do the eat logic

	var food_x = this.food_posi[food_index*2];
	var food_y = this.food_posi[food_index*2+1];
	if (Math.sqrt(Math.pow((food_x-posi_x),2)+Math.pow((food_y-posi_y),2))<=this.score[index]+1) {
		//update Score
    	this.updateUserScore(index, posi_x, posi_y, this.score[index]+1, io,timestamp);
        boardcastToAllUser(io,"food_eat_succ",{index:index,posi_x:posi_x,posi_y:posi_y,food_index: food_index,score:this.score[index]});
        this.generateFood(food_index,getUNIXTimestamp(),io);
        HighLog("Eat food succ");
	}else{
		//unable to eat
		    boardcastToAUser(this.sockets[index],"food_eat_fail",{index:index,posi_x:posi_x,posi_y:posi_y,food_index: food_index, food_x:this.food_posi[food_index*2],food_y:this.food_posi[food_index*2+1]});
        HighLog("Eat food failed due to unable to eat - the position of the food is not in the range of the user");
        HighLog("Distance "+Math.sqrt(Math.pow((food_x-posi_x),2)+Math.pow((food_y-posi_y),2))+" ; User Mass: "+this.score[index]);
	}
	//may involve powerup, add later
};

GameBoard.prototype.userCapturingUser = function (index, posi_x,posi_y,user_index,io,timestamp) {

	//similar to userEatFood, but need to inform the eaten user.
    LowLog("User Capturing User: "+this.position[user_index*2]+" "+this.position[user_index*2+1]+" user: "+this.position[index*2]+" "+this.position[index*2+1]);
    HighLog();
    if (!this.validateUserPosition(index, posi_x, posi_y,io,timestamp)){
        //validation failed
        boardcastToAUser(this.sockets[index],"user_eat_fail",{index:index,posi_x:posi_x,posi_y:posi_y,food_index: food_index});
        HighLog("Capturing User failed due to position validation failed");
        return;
    }
    //calculate if the user can eat, the user's position can not be determined
    HighLog("User Capturing User: user_index "+user_index);
    //var est = GameBoard.prototype.getEstimatedPosition(user_index,timestamp);
    var posi__x = this.position[user_index*2];
    var posi__y = this.position[user_index*2+1];

    if (calculateDistance(posi_x,posi_y,posi__x,posi__y)+this.score[user_index]<=this.score[index]&&this.status[user_index]==this.statusType[0]) {
        //validation complete, prepare to eat.
        this.updateUserScore(index,posi_x,posi_y,this.score[index]+this.Default_Capture_percent*this.score[user_index],io,timestamp);
        boardcastToAllUser(io,"user_eat_succ",{index:index,user_index:user_index,posi_x:posi_x,posi_y:posi_y,score:this.score[index]});
        this.deleteUser(user_index,io);
    }else{
        //failed to eat
        boardcastToAUser(this.sockets[index],"user_eat_fail",{index:index,user_index:user_index,posi_x:posi_x,posi_y:posi_y,score:this.score[index]});
        HighLog("Capturing User failed due to user score is not big enough");
    }
};

GameBoard.prototype.userDisconnect = function(socket,io){
    HighLog("User Disconnect");
    for (var i = 0; i <= this.sockets.length - 1; i++) {
        if (this.sockets[i] == socket){
            this.deleteUser(i,io);
            return;
        }
    };
}

//logic fucntions for maintaning the game
GameBoard.prototype.deleteUser = function(index, io){
	// this.position.splice(index,1);
 //    this.sockets.splice(index,1);
 //    this.name.splice(index,1);
 //    this.speed.splice(index,1);
 //    this.direction.splice(index,1);
 //    this.score.splice(index,1);
     this.status[index] = this.statusType[1];
 //    this.timestamp.splice(index,1);
    HighLog("User "+index+" is deleted.");
    boardcastToAllUser(io,"user_leave",{index:index});
    HighLog(this.position);
    //should generate more food

    for (var i = 0; i < this.activeUserID.length; i++) {
      if (this.activeUserID[i]==index){
        this.activeUserID.splice(i,1);
      }
    }
};

GameBoard.prototype.resetUser = function(index, io,timestamp){
	//when the user connect, update the user information.
    var posi_x = generate_random_posi(this.width);
    var posi_y = generate_random_posi(this.height);
    this.updateUserPosition(index, RANDOM_X, RANDOM_Y, io,timestamp);
    this.updateUserSpeed(index, posi_x, posi_y, 0, io,timestamp);
    this.updateUserScore(index, posi_x, posi_y, this.Default_User_Mas, io,timestamp);
    this.updateUserStatus(index, posi_x, posi_y, this.statusType[0], io,timestamp);

    boardcastToAllUser(io,"user_reset",{index:index,posi_x:posi_x,posi_y:posi_y,score:this.Default_User_Mas});
};

GameBoard.prototype.generateFoods = function (num,timestamp) {
	//generate the food
    //****

    for (var i = num; i >= 0; i--) {
        var posi_x = generate_random_posi(this.width);
        var posi_y = generate_random_posi(this.height);
        this.food_posi.push(posi_x);
        this.food_posi.push(posi_y);

        //generate food type
        this.food_type.push(0);
        //boardcastToAllUser(io,"food_add",{index:index,posi_x:posi_x,posi_y:posi_y});
    };
};

GameBoard.prototype.generateFood = function (food_index,timestamp,io) {
    //generate the food
    //****
    var posi_x = generate_random_posi(this.width);
    var posi_y = generate_random_posi(this.height);
    this.food_posi[food_index*2]=posi_x;
    this.food_posi[food_index*2+1]=posi_y;
    this.food_type[food_index]=0;
    boardcastToAllUser(io,"food_add",{food_index:food_index,posi_x:posi_x,posi_y:posi_y,type:0});
};

GameBoard.prototype.addUser = function(username,socket,timestamp,io){
	//when the user connect, update the user information.
    //scan use list to find the first empty location.
    //****
    sys_log("add user: timestamp =  "+timestamp);
    var posi_x = generate_random_posi(this.width);
    var posi_y = generate_random_posi(this.height);
    var user_name = username;
    this.position.push(posi_x);
	  this.position.push(posi_y);
    this.sockets.push(socket);
    this.name.push(user_name);
    this.speed.push(1);
    this.direction.push(0);
    this.score.push(this.Default_User_Mas);
    this.status.push(this.statusType[0]);
    this.timestamp.push(timestamp);
    index = this.status.length-1;
    this.activeUserID.push(index);
    //more info
    boardcastToAUser(socket,"game_init_info",{position:this.position,name:this.name,speed:this.speed,direction:this.direction,score:this.score,status:this.status,rankboard:this.rankBoard, food:this.food_posi, food_type:this.food_type});
    boardcastToAllUser(io,"User_Add",{index:index,posi_x:posi_x,posi_y:posi_y,name:user_name});
};

GameBoard.prototype.activateUser = function(index,timestamp,io){
    this.status.push(this.STATUS[1]);
    this.timestamp.push(timestamp);

    boardcastToAllUser(io,"User_Activation",{index:index});
}

GameBoard.prototype.updateAllUserLocation = function(io){
    var userPosi = [];
    for (var i = 0; i < this.activeUserID.length; i++) {
      var tempIndex = this.activeUserID[i];
      userPosi.push(this.position[tempIndex*2]);
      userPosi.push(this.position[tempIndex*2+1]);
    }
    boardcastToAllUser(io,"updateAllUserLocation",{position:userPosi,uid:this.activeUserID,timestamp:getUNIXTimestamp()});
}


//private functions
GameBoard.prototype.getTimeStamp = function(index){
    return this.timestamp[index];
};

GameBoard.prototype.getEstimatedPosition = function(index,timestamp){
    HighLog(index);
    cur_x = this.position[index*2];
    cur_y = this.position[index*2+1];

    sys_log("getEstimatedPosition client previous posi: "+cur_x+" "+cur_y);

    last_timestamp = this.timestamp[index];
    sys_log("getEstimatedPosition timestamp: "+timestamp);
    time_diff = timestamp - last_timestamp;
    sys_log("getEstimatedPosition timediff: "+time_diff);
    sys_log("getEstimatedPosition speed: "+this.speed[index]);
    est_x = cur_x + this.speed[index]*Math.cos(this.direction[index])*(time_diff/1000);
    est_y = cur_y + this.speed[index]*Math.sin(this.direction[index])*(time_diff/1000);

    if (est_x<0) {
        est_x = 0;
    }else if (est_x>this.width){
        est_x = this.width;
    }

    if (est_y<0) {
        est_y = 0;
    }else if (est_y>this.height) {
        est_y = this.height;
    }

    return [est_x,est_y];
}

GameBoard.prototype.validatePosition = function(index,timestamp,posi_x,posi_y){
    if (posi_x<0||posi_x>this.width||posi_y<0||posi_y>this.height) {
        sys_log("validatePosition "+"out of border");
        if (posi_x<0) {
            sys_log("validatePosition "+"out of range of -x");
        }

        if (posi_x>this.width) {
            sys_log("validatePosition "+"out of range of x");
        }

        if (posi_y<0) {
            sys_log("validatePosition "+"out of range of -y");
        }

        if (posi_x>this.height) {
            sys_log("validatePosition "+"out of range of +y");
        }
        return false;
    }

    var est = this.getEstimatedPosition(index,timestamp);

    if (Math.sqrt(Math.pow((est[0]-posi_x),2)+Math.pow((est[1]-posi_y),2))<=this.tolerance) {
        return true;
    }else{
        sys_log("position not consistent: est - "+est[0]+" "+est[1]+" - client "+posi_x+" "+posi_y);
        return false;
    }
}


GameBoard.prototype.setTimeStamp = function(index,timestamp){
    this.timestamp[index] = timestamp;
    sys_log("set time stamp "+timestamp);
    sys_log("Time Lag "+ (getUNIXTimestamp()-timestamp));
    boardcastToAUser(this.sockets[index],"timeLag",{sendingTime:timestamp,currentTime:getUNIXTimestamp()});
};


function calculateDistance(x,y,X,Y){
    return Math.sqrt(Math.pow((X-x),2)+Math.pow((Y-y),2));
}

function boardcastToAllUser(io,tag,para){
    io.emit(tag,para);
}

function boardcastToAUser(socket,tag,para){
    socket.emit(tag,para);
}

function generate_random_posi(range){
    return Math.round(Math.random()*range);
}

function sys_log(msg){
    //console.log(msg);
}

function LowLog(msg){
    //console.log("Low Log: "+msg);
}

function HighLog(msg){
    //console.log("High Log: "+msg);
}

function getUNIXTimestamp(){
    return Math.floor(Date.now());//change the server accordingly.
}
