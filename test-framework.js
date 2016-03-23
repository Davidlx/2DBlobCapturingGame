
///////



// To Test a js class or a js function, you can use the provided functions in this framework
// However, this framework can only run at Node.js Command Line Tool Enviornment
// Also, you need to use "npm install unit.js" to set the enviornment for testing
var test = require('unit.js');


// To test a function, you need to be able to refer to that function
// You can either copy and paste it here, or you can include that file which is recommonded

// During the testing process, you need to write as many testing cases as you can untill you can not find more.
// For each testing case, you need to use the function as below to assert it (which is a way to test it). More APIs are provided here: http://unitjs.com/guide/quickstart.html
// test.assert(typeof 'foobar' == 'int');


// Ideally, you need to test at least 5 cases against each functions. And you need to provide commonts for each test case.
var Gameboard = require('./GameBoard.js');

var MAP_SIZE = 1600;
var gameboard = new Gameboard(MAP_SIZE,MAP_SIZE);

var PERCENTAGE = 0.9;

var AIStartled = false;
var AI_STARTLED_DISTANCE = 250;
var AI_Interval_ID = [];
var AI_Interval_Move_ID = [];

//Started to Test

//Adding users
console.log("Testing adding/deleting User\n");
gameboard.addUser("test1",null,getUNIXTimestamp,null);
test.assert(gameboard.name[0]=="test1");
console.log("Test Case: Adding the first user");
gameboard.addUser("test2",null,getUNIXTimestamp,null);
test.assert(gameboard.name[0]=="test1");
test.assert(gameboard.name[1]=="test2");
console.log("Test Case: Adding the second user and see if the logic stands");

gameboard.deleteUser(0,null);
test.assert(gameboard.status[0]==gameboard.statusType[1]);
console.log("Test Case: Delete the user and see if the status changed");
gameboard.deleteUser(1,null);
test.assert(gameboard.status[1]==gameboard.statusType[1]);
console.log("Test Case: Delete the user and see if the status changed");

gameboard.addUser("test1",null,getUNIXTimestamp,null);
test.assert(gameboard.name[2]=="test1");
console.log("Test Case: Add a user after deleting");
console.log("=========");
console.log("Complete!\n");

// Test on update position
console.log("Testing updating position\n");
gameboard.updateUserPosition(2, 0, 0,null,getUNIXTimestamp());
test.assert(gameboard.position[4]==0);
test.assert(gameboard.position[5]==0);
console.log("Test Case: Location updates case 1");
gameboard.updateUserPosition(2, 0, 1,null,getUNIXTimestamp());
test.assert(gameboard.position[4]==0);
test.assert(gameboard.position[5]==1);
console.log("Test Case: Location updates case 2");
gameboard.updateUserPosition(2, 1, 0,null,getUNIXTimestamp());
test.assert(gameboard.position[4]==1);
test.assert(gameboard.position[5]==0);
console.log("Test Case: Location updates case 3");
gameboard.updateUserPosition(2, 1, 0,null,getUNIXTimestamp());
test.assert(gameboard.position[4]==1);
test.assert(gameboard.position[5]==0);
console.log("Test Case: Location updates case 4");
console.log("=========");
console.log("Complete!\n");

// Test on food_eat
console.log("Testing user eat food\n");
var tmpScore = gameboard.score[2];
var foodNum = gameboard.food_posi.length/2;
gameboard.userEatFood(2, 0, 0,0,null,getUNIXTimestamp());
test.assert(gameboard.score[2]==tmpScore);
console.log("Test Case: Simulate the unsuccessful eating situation");
gameboard.updateUserPosition(2, gameboard.food_posi[0], gameboard.food_posi[1],null,getUNIXTimestamp());
gameboard.userEatFood(2, gameboard.position[4],gameboard.position[5],0,null,getUNIXTimestamp());
test.assert(gameboard.score[2]==(tmpScore+1));
console.log("Test Case: simulating the successful eating situation");

test.assert(gameboard.food_posi.length/2 == foodNum);
console.log("Test Case: testing the food number remains the same after eating");
console.log("=========");
console.log("Complete!\n");

//Testing User Eat User
console.log("Testing user eat user\n");

gameboard.addUser("test3",null,getUNIXTimestamp,null);
gameboard.updateUserPosition(3, gameboard.position[4]+10,gameboard.position[5]+10,null,getUNIXTimestamp());
gameboard.userCapturingUser(2, gameboard.position[4],gameboard.position[5],3,1,2,null,getUNIXTimestamp());
test.assert(gameboard.status[3]==gameboard.statusType[0]);
console.log("Test Case: simulating the wrong eating condition (Wrong location and wrong scale)");

gameboard.updateUserPosition(3, gameboard.position[4],gameboard.position[5],null,getUNIXTimestamp());
gameboard.userCapturingUser(2, gameboard.position[4],gameboard.position[5],3,1,2,null,getUNIXTimestamp());
test.assert(gameboard.status[3]==gameboard.statusType[0]);
console.log("Test Case: simulating the wrong eating condition (Wrong scale)");

gameboard.updateUserPosition(3, gameboard.position[4],gameboard.position[5],null,getUNIXTimestamp());
gameboard.userCapturingUser(2, gameboard.position[4],gameboard.position[5],3,2,1,null,getUNIXTimestamp());
test.assert(gameboard.status[3]==gameboard.statusType[1]);
console.log("Test Case: simulating the correct eating condition");
console.log("=========");
console.log("Complete!\n");

// the end of the test
console.log("You have finished all the test for the server logic part.\n");

console.log("Here is the test for AI part.\n");

// Testing adding AI
console.log("Testing getting user direction\n");
// sumilate an AI
gameboard.addUser("AI",null,getUNIXTimestamp(),null);
gameboard.updateUserPosition(4, gameboard.position[4]+AI_STARTLED_DISTANCE,gameboard.position[5],null,getUNIXTimestamp());
var dir = userDetection(4);
test.assert(dir.userNearby == false);
console.log("Test Case: simulate not near by situation --- Passed");

gameboard.updateUserPosition(4, gameboard.position[4]+AI_STARTLED_DISTANCE/2,gameboard.position[5],null,getUNIXTimestamp());
var dir = userDetection(4);
test.assert(dir.userNearby == true);
test.assert(dir.userIndex = 2);
console.log("Test Case: simulate is near by situation --- Passed");
console.log("Test Case: returned the right user --- Passed");




// Common fucntions
function getUNIXTimestamp(){
    return Math.floor(Date.now());//change the server accordingly.
}

// AI functions, not all of them, but those can be tested
function userDetection(index){
	var isNearby = false;
	var nearestUserIndex;
	var nearestDistance = AI_STARTLED_DISTANCE;
	var dist;
	for(var i=0;i<gameboard.activeUserID.length;i++){
		if(gameboard.activeUserID[i]!=index){
			dist = calDistance(gameboard.position[index*2],gameboard.position[index*2+1],gameboard.position[gameboard.activeUserID[i]*2],gameboard.position[gameboard.activeUserID[i]*2+1]);
			if(dist<AI_STARTLED_DISTANCE && dist<nearestDistance){
				nearestDistance = dist;
				nearestUserIndex = gameboard.activeUserID[i];
				isNearby = true;
			}
		}
	}
	return {userNearby:isNearby, userIndex: nearestUserIndex};
}

function calDistance(ax,ay,bx,by){
	return Math.pow((Math.pow(ax-bx,2)+Math.pow(ay-by,2)),0.5);
}


function calAngle(ax,ay,bx,by){
	return Math.atan2(by-ay,bx-ax);
}

function runAwayFromUsers(index,nearestUserIndex){
	var angle = calAngle(gameboard.position[index*2],gameboard.position[index*2+1],gameboard.position[nearestUserIndex*2],gameboard.position[nearestUserIndex*2+1]);
	var op_direc = angle - Math.PI;
	if(op_direc< -Math.PI){
		op_direc += 2 * Math.PI;
	}

  if (towardsWall(index,op_direc)) {
    //escape from the wall
    if (gameboard.position[index*2]<50 && (op_direc>(Math.PI/2)||op_direc<(-Math.PI/2))) {
      console.log("towards left");
      return 0;

    }else if (gameboard.position[index*2]>(gameboard.width-50) && ((op_direc<(Math.PI/2) && op_direc > 0) || op_direc > (-Math.PI/2))) {
      console.log("towards Right");
      return -Math.PI;
    }else if (gameboard.position[index*2+1]<50 && op_direc < 0) {
      console.log("towards bottom");
      return Math.PI/2;
    }else if (gameboard.position[index*2+1]>(gameboard.height-50) && op_direc > 0) {
      console.log("towards top");
      return -Math.PI/2;;
    }
  }

	return op_direc;
}

function towardsWall(index,op_direc){
  if (gameboard.position[index*2]<50 && (op_direc>(Math.PI/2)||op_direc<(-Math.PI/2))) {
    return true;
  }else if (gameboard.position[index*2]>(gameboard.width-50) && ((op_direc<(Math.PI/2) && op_direc > 0) || op_direc > (-Math.PI/2))) {
    return true;
  }else if (gameboard.position[index*2+1]<50 && op_direc < 0) {
    return true;
  }else if (gameboard.position[index*2+1]<(gameboard.height-50) && op_direc > 0) {
    return true;
  }
  return false;
}

//input: angle_c, a, b
//output: angle_ACD, 2*d
function calVector(angle,a,b){
	var c = Math.pow((Math.pow(a,2)+Math.pow(b,2)-2*a*b*Math.cos(angle)),0.5);
	var angle_a = (Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c);
	var d = Math.pow((Math.pow(b,2)+Math.pow(0.5*c,2)-2*b*0.5*c*Math.cos(angle_a)),0.5);

	var v_angle = Math.acos((Math.pow(b,2)+Math.pow(d,2)-Math(0.5*c,2))/(2*b*d));
	var v_length = 2*d;
	return v_angle;
}


/* Test for Client Side */
	console.log ("\n\n");
	console.log("Begin testing for client side");
	console.log("=============================\n\n");
	
    //Adding food test
    var food = [];
	var food_posi_x = [];
	var food_posi_y = [];
    console.log("Testing adding food");
    addFoodOnMap(0, 0, 0, 0);
    test.assert(food[0] == "normalFood");
    test.assert(food_posi_x[0] == 0);
    test.assert(food_posi_y[0] == 0);
    console.log("Adding first food");
    addFoodOnMap(1, 1, 10, 50);
    test.assert(food[0] == "normalFood");
    test.assert(food_posi_x[0] == 0);
    test.assert(food_posi_y[0] == 0);
    test.assert(food[1] == "speedup");
    test.assert(food_posi_x[1] == 10);
    test.assert(food_posi_y[1] == 50);
    console.log("Adding second food");
    console.log("Test Case: Add foods on map");
	console.log("=========");
	console.log("Complete!\n");

	//Collision detection test
	console.log("Testing collision detection");
	test.assert(collisionDetection(5, 0, 0, 3, 2, 2) == true);
	test.assert(collisionDetection(3, 0, 0, 5, 2, 2) == true);
	test.assert(collisionDetection(5, 0, 0, 3, 12, 12) == false);
	test.assert(collisionDetection(5, 5, 5, 3, 12, 12) == false);
	console.log("Test Case: Collision detection");
	console.log("=========");
	console.log("Complete!\n");

	//Calculate speed algorithm test
	var isSpeedUp = false;
    var INITIAL_SPEED = 3;
    var INITIAL_SCORE = 10;
    console.log("Testing calculate speed algorithm");
    test.assert(calculateSpeedAlgorithm(0.02) == 3);
    console.log("Testing initial speed");
    test.assert(calculateSpeedAlgorithm(1) == 1.6500000000000001);
    console.log("Testing speed with no speedup");
    
    isSpeedUp = true;
    test.assert(calculateSpeedAlgorithm(0.02) == 6);
    console.log("Testing speedup");
    test.assert(calculateSpeedAlgorithm(1) == 6);
    console.log("Testing speedup with different scale should have same speed");
    console.log("Test Case: Calculate speed algorithm");
	console.log("=========");
	console.log("Complete!\n");

	//Calculate player scale test
	console.log("Testing calculate player scale algorithm without shrink powerup");
	var isShrink = false;
	test.assert(calculatePlayerScale(10) == 0.03);
	console.log("Testing initial score scale");
	test.assert(calculatePlayerScale(50) == 0.15);
	console.log("Testing score less than 100");
	test.assert(calculatePlayerScale(200) == 0.36);
	console.log("Testing score bigger than 100 but less than 500");
	test.assert(calculatePlayerScale(502) == 0.6);
	console.log("Testing score bigger than 500\n");

	console.log("Testing calculate player scale algorithm with shrink powerup");
	isShrink = true;
	test.assert(calculatePlayerScale(10) == 0.015);
	console.log("Testing initial score scale");
	test.assert(calculatePlayerScale(50) == 0.075);
	console.log("Testing score less than 100");
	test.assert(calculatePlayerScale(200) == 0.18);
	console.log("Testing score bigger than 100 but less than 500");
	test.assert(calculatePlayerScale(502) == 0.3);
	console.log("Testing score bigger than 500");

	console.log("Test Case: Calculate player scale algorithm");
	console.log("=========");
	console.log("Complete!\n");

    //Testing calculate angle algorithm
    console.log("Testing calculate angle algorithm without reverse powerup");
    var isReverse = false;
 	test.assert(calculateAngle(0,0,0,0) == 0);
    console.log("Test calculate angle case 1");
    test.assert(calculateAngle(0,0,0,90) == 1.5707963267948966);
    console.log("Test calculate angle case 2");
    test.assert(calculateAngle(0,0,90,0) == 0);
    console.log("Test calculate angle case 3\n");

    console.log("Testing calculate angle algorithm with reverse powerup");
    isReverse = true;
    test.assert(calculateAngle(0,0,0,0) == 0








    	);
    console.log("Test calculate angle case 4");
    test.assert(calculateAngle(0,0,0,90) == -1.5707963267948966);
    console.log("Test calculate angle case 5");
    test.assert(calculateAngle(0,0,90,0) == 3.141592653589793);
    console.log("Test calculate angle case 6");
    console.log("Test Case: Calculate angle algorithm");
	console.log("=========");
	console.log("Complete!\n");


 	//Testing move function
    var method = nmap.prototype;
    function nmap(width,height){
    	var x;
    	var y;
    	this.width = width;
    	this.height = height;
    }
    method.getPositionX = function(){
    	return x;
    }
    method.getPositionY = function(){
    	return y;
    }
    method.setPositionX = function(px){
    	x = px;
    }
    method.setPositionY = function(py){
    	y = py;
    };
    module.exports = nmap;

    var method2 = nsize.prototype;
    function nsize(width,height){
    	this.width = width;
    	this.height = height;
    }
    module.exports = nsize;
    var map = new nmap(1600,1600);
    var size = new nsize(300,300);
    var angle = 180;
    var speed = 3;
    map.setPositionX(120);
    map.setPositionY(120);
    move(angle,speed);
    console.log("Testing Moving Function")
    test.assert(map.getPositionX()==118.20461979282642);
    test.assert(map.getPositionY()==117.59654209279852);
    console.log("Test Moving function case 1");
    move(angle,speed);
    test.assert(map.getPositionX()==116.40923958565284);
    test.assert(map.getPositionY()==115.19308418559703);
    console.log("Test Moving function case 2");
    console.log("=========");
	console.log("Complete!\n");
    
	console.log("Testing screen2map function")
    var map = new nmap(1,1);
    map.setPositionX(20);
    map.setPositionY(20);
    var nx,ny;
    nx = screen2map(22,23)[0];
    test.assert(nx==2);
	ny = screen2map(25,26)[1];
	test.assert(ny==6);
	console.log("Test screen2map function case 1");
	nx = screen2map(34,21)[0];
    test.assert(nx==14);
	ny = screen2map(27,150)[1];
	test.assert(ny==130);
	console.log("Test screen2map function case 1");
	console.log("Test Moving function case 2");
    console.log("=========");
	console.log("Complete!\n");

    function screen2map(scrX, scrY) {
        var x = scrX - map.getPositionX();
        var y = scrY - map.getPositionY();
        return [x, y];
    }


    function move(angle, speed){
    	var isLeft = true;
    	var isRight = true;
    	var isUp = true;
    	var isDown = true;
    	var sin = Math.sin(angle);
    	var cos = Math.cos(angle);

    	if(map.getPositionX()>size.width/2-10) isLeft = false;
    	else isLeft = true;
    	if(map.getPositionX()<size.width/2-map.width+10) isRight = false;
    	else isRight = true;
    	if(map.getPositionY()<size.height/2-map.height+10) isDown = false;
    	else isDown = true;
    	if(map.getPositionY()>size.height/2-10) isUp = false;
    	else isUp = true;

    	if(cos<0){
        	if(isRight) map.setPositionX(map.getPositionX() + speed * cos);
        	if(sin<0){
            	if(isDown) map.setPositionY(map.getPositionY() + speed * sin);
        	}else{
            	if(isUp) map.setPositionY(map.getPositionY() + speed * sin);
        	}
    	}else {
        	if(isLeft) map.setPositionX(map.getPositionX() + speed * cos);
        	if(sin<0){
            	if(isDown) map.setPositionY(map.getPositionY() + speed * sin);
        	}else{
            	if(isUp) map.setPositionY(map.getPositionY() + speed * sin);
        	}
    	}
	}

 	function addFoodOnMap(food_index,food_type,x,y) {
        if (food_type == 0) {
           food[food_index] = "normalFood";
        }
        else if (food_type == 1) {
            food[food_index] = "speedup";
        }

        else if (food_type == 2) {
            food[food_index] = "poison";
        }
        else if (food_type == 3) {
            food[food_index] = "shrink";
        }
        else if (food_type == 4) {
            food[food_index] = "reverse";
        }
        food_posi_x[food_index] = x;
        food_posi_y[food_index] = y;
    }

    function collisionDetection(aRad, ax, ay, bRad, bx, by) {
        var distanceX = bx - ax;
        var distanceY = by - ay;
        var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < (aRad + bRad))
            return true;
        else
            return false;
    }

    function calculateSpeedAlgorithm(scale) {
        var speed;
        if (isSpeedUp == true) {
            return INITIAL_SPEED * 2;
        }
        else {
            if (scale == 0.002 * INITIAL_SCORE) {
                speed = INITIAL_SPEED;
                return speed;
            }
            var radius = (scale * 500) / 2;
            speed = INITIAL_SPEED * (1 - radius * 0.0018);
            return speed;
        }
    }

    function calculatePlayerScale(score) {
        var scale;
        if (score < 100) {
            scale = score * 0.003;
        }
        else if (score < 500) {
            scale = 100 * 0.003 + (score - 100) * 0.0006;
        }
        else {
            scale = 100 * 0.003 + 500 * 0.0006;
        }

        if (isShrink == true) {
            return scale * 0.5;
        } else {
            return scale;
        }
    }

    function calculateAngle(sourcePointX, sourcePointY, targetPointX, targetPointY) {
        var tempAngle;
        if (isReverse == false) {
            tempAngle = (Math.atan2(targetPointY - sourcePointY, targetPointX - sourcePointX));
        } else {
            var reversePointX, reversePointY;
            reversePointX = 2 * sourcePointX - targetPointX;
            reversePointY = 2 * sourcePointY - targetPointY;
            tempAngle = (Math.atan2(reversePointY - sourcePointY, reversePointX - sourcePointX));
        }
        return tempAngle;
    }


































