function playGame(socket, game) {

var myBoard = JSON.parse(window.localStorage.gameBoard);
var myHits = JSON.parse(window.localStorage.hits);
console.log("board is", myBoard);
// console.log(game);

socket.on('update_oSocket', function(oSocket) {
  console.log('osocket updated to', oSocket);
  game.oSocket = oSocket;
});

$('.opponentTile').mouseenter(function() {
  if (window.localStorage.isYourTurn === "true") {
    $(this).addClass('hover');
  }
});
$('.opponentTile').mouseleave(function() {
  if (window.localStorage.isYourTurn === "true") {
    $(this).removeClass('hover');
  }
});

//SEND a shot
$('.opponentTile').click(function() {
  $(this).removeClass('hover');
  if (window.localStorage.isYourTurn === "true") {

    var tileNumber = parseInt($(this).attr('id'));
    $(this).addClass('shot'); //adding 'shot' CSS
    window.localStorage.isYourTurn = "false";
    socket.emit('tile_shot', tileNumber, game);
  }
});

//RECEIVE a shot
socket.on('tile_hit', function(tileNumber) {
  var hitTileData = myBoard[tileNumber-1];
  hitTileData.hit = true;
  if (hitTileData.active) {
    $('#p'+(tileNumber.toString())).addClass('hitTrue');
    $('.result').empty();
    $('.result').append(hitTileData.ship+" shot! Your turn");
  } else {
    $('#p'+(tileNumber.toString())).addClass('hitFalse');
    $('.result').empty();
    $('.result').append(oname+" missed! Your turn");
  }
  window.localStorage.isYourTurn = "true";
  console.log(hitTileData);
  window.localStorage.gameBoard = JSON.stringify(myBoard);

  socket.emit('hit_response', hitTileData, tileNumber, game);
});

//RECEIVE a shot response
socket.on('hit_result', function(oTileHit, tileNumber) {
  myHits[tileNumber-1].hit = true;
  if (oTileHit.active === true) {
    $('.result').empty();
    $('.result').append("NICE HIT. "+oname+"'s turn");
    console.log("Nice!! You got a hit, and you hit ship", oTileHit.ship);
    $('#'+(tileNumber.toString())).addClass('shotTrue');
    myHits[tileNumber-1].ship = oTileHit.ship;
  } else {
    $('.result').empty();
    $('.result').append("miss. "+oname+"'s turn");
    console.log("You missed!");
    $('#'+(tileNumber.toString())).addClass('shotFalse');
  }
  window.localStorage.hits = JSON.stringify(myHits);
});






}