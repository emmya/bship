function drawGame(name, oname, pnum, turn) {

  $('.oName').append(oname);

  if (turn === "true") {
    $('.turn').append('Your turn');
  } else {
    $('.turn').append(oname+"'s turn");
  }

// =======================
//  DRAWING OPPONENT BOARD
// =======================
  // draw tile divs
function drawOpponentBoard() {
  for (var d=1; d<=100; d++) {
    $('.opponentBoard').append("<div class='tile opponentTile' id='"+d+"'></div>");
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


}