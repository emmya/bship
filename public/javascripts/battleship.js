function playGame(socket, game) {

var myBoard = JSON.parse(window.localStorage.gameBoard);
var myHits = JSON.parse(window.localStorage.hits);
console.log("board is", myBoard);
// console.log(game);

socket.on('update_oSocket', function(oSocket) {
  console.log('osocket updated to', oSocket);
  game.oSocket = oSocket;
});

//SEND a shot
$('.opponentTile').click(function() {
  if (window.localStorage.isYourTurn === "true") {

    var tileNumber = parseInt($(this).attr('id'));
    $(this).addClass('shot'); //adding 'shot' CSS
    window.localStorage.isYourTurn = "false";
    $('.turn').empty();
    $('.turn').append(oname+"'s turn");
    socket.emit('tile_shot', tileNumber, game);
  }
});

//RECEIVE a shot
socket.on('tile_hit', function(tileNumber) {
  var hitTileData = myBoard[tileNumber-1];
  hitTileData.hit = true;
  if (hitTileData.active) {
    $('#'+(tileNumber.toString())).addClass('hitTrue');
  } else {
    $('#'+(tileNumber.toString())).addClass('hitFalse');
  }
  window.localStorage.isYourTurn = "true";
  $('.turn').empty();
  $('.turn').append("Your turn");
  console.log(hitTileData);
  window.localStorage.gameBoard = JSON.stringify(myBoard);

  socket.emit('hit_response', hitTileData, tileNumber, game);
});

//RECEIVE a shot response
socket.on('hit_result', function(oTileHit, tileNumber) {
  myHits[tileNumber-1].hit = true;
  if (oTileHit.active === true) {
    console.log("Nice!! You got a hit, and you hit ship", oTileHit.ship);
    $('#'+(tileNumber.toString())).addClass('shotTrue');
    myHits[tileNumber-1].ship = oTileHit.ship;
  } else {
    console.log("You missed!");
    $('#'+(tileNumber.toString())).addClass('shotFalse');
  }
  window.localStorage.hits = JSON.stringify(myHits);
});






}