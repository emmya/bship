  var Game = function(myName, pnum, room, mySocket, oSocket) {
    this.myName = myName;
    this.pnum = pnum;
    this.room = room;
    this.mySocket = mySocket;
    this.oSocket = oSocket;
  };

document.addEventListener("DOMContentLoaded", function(event) {

  var auth = false;
  var player1 = document.getElementById('player1').innerHTML,
      player2 = document.getElementById('player2').innerHTML,
      gameId = document.getElementById('gameid').innerHTML;
  var myName = window.localStorage.name,
      oName = "opponent",
      pnum;
  var room = gameId.toString();

//establishing authentication and assigning names
  if (myName === player1) {
    document.title = "p1";
    oname = player2;
    pnum = 1;
    auth = true;
  } else if (myName === player2) {
    document.title = "p2";
    oname = player1;
    pnum = 2;
    auth = true;
  } else {
    document.title = "Visitor";
    alert("Not your game! Please return to waiting room.");
    window.location = "/";
  }
//making sure user has already created their board
  if (window.localStorage.gameBoard) {
    if (window.localStorage.gameBoard.length < 1) {
      alert("You still need to set up your game.");
      window.location = "/battleship/setup/"+room;
    }
  }

  if (auth) {
    var game = new Game();
    var socket = io('/');
    socket.on('connect', function() {
      socket.emit("player_connected", room, pnum, myName);
    });
    socket.on('waiting', function() {
      console.log('waiting on opponent');
      $('.waiting').removeClass('hide');
    });
    socket.on('draw_game', function(p1socket, p2socket, oIsConnected) {
      $('.waiting').addClass('hide');
      drawGame(myName, oname, pnum, window.localStorage.isYourTurn);
      game.myName = myName;
      game.pnum = pnum;
      game.room = room;
      if (pnum === 1) {
        game.mySocket = p1socket;
        game.oSocket = p2socket;
      } else {
        game.mySocket = p2socket;
        game.oSocket = p1socket;
      }

      console.log("calling play game with mysocket", game.mySocket, 'oSocket', game.oSocket, 'and oisconnected', oIsConnected);
      playGame(socket, game, oIsConnected);
    });

    // socket.on('not_connected', function() {
    //   console.log("o not connected");
    //   $('.isConnected').empty().append("///// Warning: opponent is not connected. ");
    // });




  } //close if auth check
});