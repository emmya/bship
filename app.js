var express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    methodOverride = require('method-override'),
    db = require("./models/index.js");
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
// GET page
app.get('/', function(req, res) {
  res.render('home');
});
// Live list of connected Users
var User = function(name, socket) {
  this.name = name;
  this.socket = socket;
};
var onlineList = [];

// SOCKET namespace for waiting room
var home = io.of('/home');
home.on('connection', function(socket) {
  console.log("New user connected");
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
      p1name: sender,
      p2name: accepter,
      p1socket: senderSocket,
      p2socket: accepterSocket,
      p1ready: false,
      p2ready: false,
      p1reconnect: true,
      p2reconnect: true
    }).done(function(err, game) {
      if (err) {
        console.log(err);
      }
      console.log("New battleship game created");
      var gameid = game.id;
      home.to(senderSocket).emit('setup_redirect', game.id, "p1");
      home.to(accepterSocket).emit('setup_redirect', game.id, "p2");
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
  }
});

// ==========================
// ====    GAME SETUP    ====
// ==========================
app.get('/battleship/setup/:id', function(req,res) {
  var gameid = req.params.id;
  db.Battleship.find(gameid).done(function(err, game) {
    res.render('setup',
      {p1: game.p1name, p2: game.p2name, gameId:game.id});
  });
});

app.get('/battleship/:id', function(req,res) {
  var gameid = req.params.id;
  db.Battleship.find(gameid).done(function(err, game) {
    res.render('battleship',
      {p1: game.p1name, p2: game.p2name, gameId:game.id});
  });
});

// Live list of connected Players
var gameSocket = io.of('/');
var Player = function(name, pNum, gameId, socket) {
  this.name = name;
  this.pNum = pNum;
  this.gameId = gameId;
  this.socket = socket;
};
var playerList = [];

// *** GAME SOCKET ***
gameSocket.on('connection', function(socket) {
  console.log("New player connected");
  //disconnect handler
  socket.on('disconnect', function() {
    console.log("Player disconnected.");
    for (var i=0; i<playerList.length; i++) {
      if (playerList[i].socket === socket.id) {
        io.to(playerList[i].gameId).emit('opponent_disconnected');
        playerList.splice(i, 1);
      }
    }
  });

  //connected to game
  socket.on('player_connected', function(room, pnum, name) {
    var newPlayer = new Player(name, pnum, room, socket.id);
    playerList.push(newPlayer);
    socket.user = newPlayer;
    socket.join(room);
    console.log("Player", name, "connected to game room", room);

    var gameid = parseInt(room);
    db.Battleship.find(gameid).done(function(err, game) {
      if (game.p1ready && game.p2ready) { //if player is reconnecting to a game
        if (pnum === 1) {
          game.updateAttributes({
            p1socket: socket.id,
            p1reconnect: true });
          if (isOppConnected(game.p2name, room)) { //emits update to opp
            io.to(game.p2socket).emit('update_oSocket', socket.id);
            io.to(socket.id).emit('draw_game', game.p1socket, game.p2socket, true); //emits only to reconnected socket
          } else {
            io.to(socket.id).emit('draw_game', game.p1socket, game.p2socket, false); //emits only to reconnected socket
            console.log('Your opponent (p2) is not connected');
          }
        } else {
          game.updateAttributes({
            p2socket: socket.id,
            p2reconnect: true });
          if (isOppConnected(game.p1name, room)) { //emits update to opp
            io.to(game.p1socket).emit('update_oSocket', socket.id);
            io.to(socket.id).emit('draw_game', game.p1socket, game.p2socket, true); //emits only to reconnected socket
          } else {
            io.to(socket.id).emit('draw_game', game.p1socket, game.p2socket, false); //emits only to reconnected socket
            console.log('Your opponent (p1) is not connected');
          }
        }
      } else { //if the game hasn't begun yet
        if (pnum === 1) {
          game.updateAttributes({
            p1socket: socket.id,
            p1ready: true });
        } else {
          game.updateAttributes({
            p2socket: socket.id,
            p2ready: true });
        }
        if (game.p1ready && game.p2ready) {
          io.to(room).emit('draw_game', game.p1socket, game.p2socket, true);
        } else {
          io.to(socket.id).emit('waiting');
        }
      }
    });
  }); //close player_connected response

// *************************
//        GAME CALLS
// *************************

  socket.on('tile_shot', function(number, game) {
    console.log('received tile shot call from', game.myName, 'and about to emit tile_hit to', game.oSocket);
    io.to(game.oSocket).emit('tile_hit', number);
  });

  socket.on('hit_response', function(oTileData, tileNumber, game) {
    console.log('received hit response call from', game.myName, 'and about to emit result to', game.oSocket);
    io.to(game.oSocket).emit('hit_result', oTileData, tileNumber);
  });

  socket.on('win', function(game) {
    console.log("player", game.myName, "has won");
    io.to(game.oSocket).emit('loss', game);
  });


}); //close gameSocket listener

//checks if opponent is in playerList
function isOppConnected(name, room) {
  console.log('checking name is', name, 'room is', room);
  for (var ppl in playerList) {
    console.log('checking against', playerList[ppl].name, playerList[ppl].gameId);
    if (playerList[ppl].name === name && playerList[ppl].gameId === room) {
      return true;
    }
  }
  return false;
}

var server = http.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port %d', server.address().port);
});