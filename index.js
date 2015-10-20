var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gameboard = require('GameBoard.js')(1024,1024);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('user name', function(username){
    socket.userIndex = users.length;
    socket.username = username;
    usocket[socket.userIndex] = socket;
    users.push(username);
    socket.emit('welcome');
    io.emit('user login', username);
    io.emit('users count', users.length);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    users.splice(socket.userIndex, 1);
    usocket.splice(socket.userIndex, 1);
    io.emit('disconnect', socket.username);
    io.emit('users count', users.length);
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
