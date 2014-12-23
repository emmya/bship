var express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    methodOverride = require('method-override'),
    db = require("./models/index.js");
    // gulp = require('gulp'),
    // sass = require('gulp-sass');
// var cookieParser = require("cookie-parser"),
    // session = require("cookie-session");
var http = require('http').Server(app),
    io = require('socket.io')(http),
    redis = require('node-redis');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

// ==========================
// ====   WAITING ROOM   ====
// ==========================

//Waiting room/home
app.get('/', function(req, res) {
  res.render('home');
});

var User = function(name, socket) {
  this.name = name;
  this.socket = socket;
};

var onlineList = [];

var home = io.of('/home');

home.on('connection', function(socket) {
  console.log("New user connected");
  // socket.to(socket.id).emit('newSocket', socket.id);
//ADD USER TO onlineList
  socket.on('adduser', function(user) {
    var newUser = new User(user, socket.id);
    socket.user = newUser;
    // console.log("newUser name is", newUser.name);
    // console.log("newUser socket is", newUser.socket);
    // console.log("socket.user is", socket.user);
    onlineList.push(newUser);
    // console.log("onlineList length is", onlineList.length);
    updateClients();
  });
//INVITE
  socket.on('invite', function(recipient, sender) {
    console.log("server side invite call");
    home.to(recipient).emit('receive_invitation', sender);
  });
//ACCEPT INVITE
  socket.on('accept_invite', function(senderSocket, accepterSocket, sender, accepter) {
    console.log("server side accepted call");
    db.Battleship.create({
      player1: sender,
      player2: accepter,
      p1board: null,
      p2board: null,
      p1ready: false,
      p2ready: false
    }).done(function(err, game) {
      if (err) {
        console.log(err);
      }
      console.log("battleship game created");
      var gameid = game.id;
      console.log("emitting redirect to", senderSocket, "and", accepterSocket);
      home.to(senderSocket).emit('game_redirect', game.id, "p1");
      home.to(accepterSocket).emit('game_redirect', game.id, "p2");
      console.log("done emitting");
    });
  });

//DISCONNECT HANDLER
  socket.on('disconnect', function() {
    console.log("User disconnected");
    for (var i=0; i<onlineList.length; i++) {
      if (onlineList[i] === socket.user) {
        onlineList.splice(i, 1);
      }
    }
    updateClients();
  });

  function updateClients() {
    home.emit('update', onlineList);
    // console.log("updateClients() function called with list "+onlineList);
  }
});




var server = http.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});