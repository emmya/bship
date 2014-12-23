function playGame(socket, game) {

var myBoard = JSON.parse(window.localStorage.gameBoard);
console.log(game);

socket.on('update_oSocket', function(oSocket) {
  console.log('osocket updated to', oSocket);
  game.oSocket = oSocket;
});

$('.opponentTile').click(function() {
  if (window.localStorage.isYourTurn === "true") {
    console.log("tile clicked!");
    var tileNumber = parseInt($(this).attr('id'));
    $(this).addClass('shot'); //adding 'shot' CSS
    window.localStorage.isYourTurn = "false";
    $('.turn').empty();
    $('.turn').append(oname+"'s turn");
    socket.emit('tile_shot', tileNumber, game);
  }
});

socket.on('tile_hit', function(tileNumber) {
  var hitTileData = myBoard[tileNumber-1];
  if (hitTileData.active) {
    $('#'+(tileNumber.toString())).addClass('hitTrue');
    hitTileData.hit = true;
  } else {
    $('#'+(tileNumber.toString())).addClass('hitFalse');
  }

  window.localStorage.isYourTurn = "true";
  $('.turn').empty();
  $('.turn').append("Your turn");
  console.log(hitTileData);
  console.log("received shot tile row", hitTileData.row, "column", hitTileData.column);
  console.log("isTurn is now", window.localStorage.isYourTurn);

  socket.emit('hit_response', hitTileData, tileNumber, game);
});

socket.on('hit_result', function(oTileHit, tileNumber) {
  if (oTileHit.active === true) {
    console.log("Nice!! You got a hit, and you hit ship", oTileHit.ship);
    $('#'+(tileNumber.toString())).addClass('shotTrue');
  } else {
    console.log("You missed!");
    $('#'+(tileNumber.toString())).addClass('shotFalse');
  }
});






}