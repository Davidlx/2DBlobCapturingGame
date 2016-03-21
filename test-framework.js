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
console.log("You have finished all the test for the server logic part.\n\n");

console.log("Here is the test for AI part.");


// Common fucntions
function getUNIXTimestamp(){
    return Math.floor(Date.now());//change the server accordingly.
}
