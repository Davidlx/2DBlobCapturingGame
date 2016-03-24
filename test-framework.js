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
console.log("=========");
console.log("Complete!\n");

// Testing towards wall function
console.log("Testing Towards function\n");
gameboard.updateUserPosition(4, gameboard.width/2,gameboard.height/2,null,getUNIXTimestamp());
var tempVal = towardsWall(4,0);
test.assert(tempVal == false);
console.log("Test Case: Right situation (false, 1) --- Passed");

gameboard.updateUserPosition(4, gameboard.width/2,gameboard.height/2,null,getUNIXTimestamp());
tempVal = towardsWall(4,Math.PI/2);
test.assert(tempVal == false);
console.log("Test Case: Right situation (false, 2) --- Passed");

gameboard.updateUserPosition(4, gameboard.width/2,gameboard.height/2,null,getUNIXTimestamp());
var tempVal = towardsWall(4,Math.PI);
test.assert(tempVal == false);
console.log("Test Case: Right situation (false, 3) --- Passed");

gameboard.updateUserPosition(4, gameboard.width/2,gameboard.height/2,null,getUNIXTimestamp());
var tempVal = towardsWall(4,-Math.PI/2);
test.assert(tempVal == false);
console.log("Test Case: Right situation (false, 4) --- Passed");

gameboard.updateUserPosition(4, 49,49,null,getUNIXTimestamp());
var tempVal = towardsWall(4,-Math.PI/2);
test.assert(tempVal == true);

console.log("Test Case: Wrong situation - (true) --- Passed");

console.log("=========");
console.log("Complete!\n");


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
  }else if (gameboard.position[index*2+1]<50 && op_direc > 0) {
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
