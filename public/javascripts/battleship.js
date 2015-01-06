function playGame(socket, game, oIsConnected) {

var myBoard = JSON.parse(window.localStorage.gameBoard);
var myHits = JSON.parse(window.localStorage.hits);
var myShots = JSON.parse(window.localStorage.shots);

//win/loss checkers
if (checkWin()){
  $('.result').empty().append("you won this game!!!");
  socket.emit('win', game);
}
socket.on('loss', function(game) {
  $('.result').empty().append("You lost to "+oname+"! Game over");
});

if (!oIsConnected) {
  $('.isConnected').empty().append("///// Opponent is not connected");
  $('.disconnected').removeClass('hide');
} else {
  $('.disconnected').addClass('hide');
}
socket.on('opponent_disconnected', function() {
  $('.disconnected').removeClass('hide');
  $('.isConnected').empty().append("///// Opponent is not connected");
});

// Opponent socket updater - called when op reconnects
socket.on('update_oSocket', function(oSocket) {
  console.log('osocket updated to', oSocket);
  game.oSocket = oSocket;
  $('.isConnected').empty();
  $('.disconnected').addClass('hide');
});

//Tile hover CSS triggers
$('.opponentTile').mouseenter(function() {
  if (window.localStorage.isYourTurn === "true") {
    $(this).addClass('hover');
  }
});
$('.opponentTile').mouseleave(function() {
  $(this).removeClass('hover');
});

//SEND a shot
$('.opponentTile').click(function() {
  $(this).removeClass('hover');
  if (window.localStorage.isYourTurn === "true") {
    var tileNumber = parseInt($(this).attr('id'));
    $(this).addClass('shot'); //adding 'shot' CSS
    window.localStorage.isYourTurn = "false";
    $('.notTurn').removeClass('hide');
    socket.emit('tile_shot', tileNumber, game);
  }
});

//RECEIVE a shot
socket.on('tile_hit', function(tileNumber) {
  var hitTileData = myBoard[tileNumber-1];
  hitTileData.hit = true;
  if (hitTileData.active) {
    $('#p'+(tileNumber.toString())).addClass('hitTrue');
    $('.result').empty().append(hitTileData.ship+" shot! Your turn");
  } else {
    $('#p'+(tileNumber.toString())).addClass('hitFalse');
    $('.result').empty().append(oname+" missed! Your turn");
  }
  window.localStorage.isYourTurn = "true";
  $('.notTurn').addClass('hide');
  console.log(hitTileData);
  window.localStorage.gameBoard = JSON.stringify(myBoard);

  socket.emit('hit_response', hitTileData, tileNumber, game);
});

//RECEIVE a shot response
socket.on('hit_result', function(oTileHit, tileNumber) {
  myHits[tileNumber-1].hit = true;
  if (oTileHit.active === true) { //hit
    $('.result').empty().append("NICE HIT. "+oname+"'s turn");
    $('#'+(tileNumber.toString())).addClass('shotTrue');
    myHits[tileNumber-1].ship = oTileHit.ship;
    for (var i in myShots) { //updates myShots
      if (oTileHit.ship === myShots[i][0]) {
        var shotson = myShots[i][1];
        myShots[i][1] = shotson -1;
        console.log("#tiles left on ship:", myShots[i][1]);
        updateShots(myShots[i]);
        break;
      }
    }
    //WIN CHECKER
    if (checkWin()){
      $('.result').empty().append("YOU WIN!!!");
      socket.emit('win', game);
    }
  } else { //miss
    $('.result').empty().append("miss. "+oname+"'s turn");
    console.log("You missed!");
    $('#'+(tileNumber.toString())).addClass('shotFalse');
  }
  window.localStorage.hits = JSON.stringify(myHits);
});

// =================
//    functions
// =================
function updateShots(shipArr) {
  if (shipArr[1] === 0) {
    $('.result').empty().append("YOU SUNK THE "+shipArr[0]+"! "+oname+"'s turn");
    $('.sunkList').append("<li>"+shipArr[0]+"</li>");
  }
  window.localStorage.shots = JSON.stringify(myShots);
}

function checkWin() {
  var w = 0;
  for (var i in myShots) {
    w += myShots[i][1];
  }
  if (w <= 0) {
    console.log("WIN!!!!");
    return true;
  }
  return false;
}



}