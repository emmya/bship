function drawGame(name, oname, pnum, turn) {

  $('.oName').append(oname);

  if (turn === "true") {
    $('.result').append('Your turn');
    $('.notTurn').addClass('hide');
  } else {
    $('.result').append(oname+"'s turn");
    $('.notTurn').removeClass('hide');
  }

var myBoard = JSON.parse(window.localStorage.gameBoard);
var myHits = JSON.parse(window.localStorage.hits); //hits on own board
var myShots = JSON.parse(window.localStorage.shots); //shots that have been made
console.log(myShots);
// console.log(myHits);

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
//  DRAWING USER'S BOARD
// =======================

function drawPlayerBoard() {
  for (var d=1; d<=100; d++) {
    $('.playerBoard').append("<div class='tile playerTile' id='p"+d+"'></div>");
    addCorrectClass(d);
  }
  // draw row/number labels
  for (var a=1; a<=10; a++) {
      $('.rowDivPlayer').append("<div class='rowLabel rowLabelPlayer'>"+a+"</div>");
  }
  var alph = "ABCDEFGHIJK";
  for (var z=0; z<10; z++) {
      $('.columnDivPlayer').append("<div class='columnLabel columnLabelPlayer' id='"+alph[z]+"'>"+alph[z]+"</div>");
  }
}
drawPlayerBoard();

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
    if (myBoard[tileNum-1].ship !== null) {
      $('#p'+id).addClass('hitTrue');
    } else {
      $('#p'+id).addClass('hitFalse');
    }
  }
}
//update shot list
for (var sh in myShots) {
  if (myShots[sh][1] === 0) {
    $('.sunkList').append("<li>"+myShots[sh][0]+"</li>");
  }
}



}