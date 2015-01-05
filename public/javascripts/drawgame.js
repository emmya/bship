function drawGame(name, oname, pnum, turn) {

  $('.oName').append(oname);

  if (turn === "true") {
    $('.turn').append('Your turn');
  } else {
    $('.turn').append(oname+"'s turn");
  }

var myBoard = JSON.parse(window.localStorage.gameBoard);
var myHits = JSON.parse(window.localStorage.hits);
console.log(myBoard);
console.log(myHits);

// =======================
//  DRAWING OPPONENT BOARD
// =======================
  // draw tile divs
function drawOpponentBoard() {
  for (var d=1; d<=100; d++) {
    $('.opponentBoard').append("<div class='tile opponentTile' id='"+d+"'></div>");
    addCorrectClass(d);
  }
  // draw row/number labels
  for (var a=1; a<=10; a++) {
      $('.rowDivOpponent').append("<div class='rowLabel'>"+a+"</div>");
  }
  var alph = "ABCDEFGHIJK";
  for (var z=0; z<10; z++) {
      $('.columnDivOpponent').append("<div class='columnLabel' id='"+alph[z]+"'>"+alph[z]+"</div>");
  }
}
drawOpponentBoard();

// =======================
//   UPDATING GAME DATA
// =======================

function addCorrectClass(tileNum) {
  var id=tileNum.toString();
  if (myHits[tileNum-1].hit === true) {
    if (myHits[tileNum-1].ship !== null) {
      $('#'+id).addClass('shotTrue');
    } else {
      $('#'+id).addClass('shotFalse');
    }
  }
  if (myBoard[tileNum-1].hit === true) {
    console.log(myBoard[tileNum-1].ship);
    if (myBoard[tileNum-1].ship !== null) {
      $('#'+id).addClass('hitTrue');
    } else {
      $('#'+id).addClass('hitFalse');
    }
  }
}




}