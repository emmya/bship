document.addEventListener("DOMContentLoaded", function(event) {

  var auth = true;
  var player1 = document.getElementById('player1').innerHTML;
  var player2 = document.getElementById('player2').innerHTML;
  var gameId = document.getElementById('gameid').innerHTML;
  var myName = window.localStorage.name;
  var room = gameId.toString();
  var pnum;

//establishing game and assigning names
  if (myName === player1) {
    document.title = "p1";
    pnum = 1;
  } else if (myName === player2) {
    document.title = "p2";
    pnum = 2;
    console.log(window.localStorage.gameBoard);
  } else {
    auth = false;
    document.title = "Visitor";
    alert("Not your game! Please return to waiting room.");
  }
//checking if user already has an active game
  if (window.localStorage.gameBoard) {
    console.log("gameBoard exists");
    if (window.localStorage.gameBoard.length > 1) {
      auth = false;
      alert("You already have an active game.");
    }
  }

// ============================
//        BEGIN SETUP
// ============================

if (auth) {
// draw tile divs
  for (var d=1; d<=100; d++) {
    $('.setupBoard').append("<div class='tile setupTile' id='"+d+"'></div>");
  }
// draw row/number labels
  for (var a=1; a<=10; a++) {
      $('.rowDivSetup').append("<div class='rowLabel' id='"+a+"'>"+a+"</div>");
  }
  var alph = "ABCDEFGHIJK";
  for (var z=0; z<10; z++) {
      $('.columnDivSetup').append("<div class='columnLabel' id='"+alph[z]+"'>"+alph[z]+"</div>");
  }

  var Ship = function(name, length, url, left, top) {
    this.name = name;
    this.length = length;
    this.url = url;
    this.isRotated = false;
    this.left = left;
    this.top = top;
  };
//Creates array of ship objects
  var ships = [];
  ships.push(new Ship("carrier", 5, "", null, null));
  ships.push(new Ship("battleship", 4, "", null, null));
  ships.push(new Ship("submarine", 3, "", null, null));
  ships.push(new Ship("cruiser", 3, "", null, null));
  ships.push(new Ship("destroyer", 2, "", null, null));

//Draws individual ship containers
  for (var num in ships) {
    $('<div/>', {
      class: "shipContainer shipContainer_"+ships[num].name,
      id: num
    }).appendTo($('.shipsContainer'));
  }
//Draws ships
  for (var ship in ships) {
  // console.log("adding ship", ships[ship].name);
    $('<div/>', {
      class: "ship "+ships[ship].name,
      id: ship
    }).appendTo($('.shipContainer_'+ships[ship].name));
  }

//DRAGGING FUNCTIONALITY
  var grid = $('.setupBoard');
  var gridSize = grid.width();
  var tileSize = gridSize/10;
  var gridOffset = grid.offset();
  var gridLeft = gridOffset.left;
  var gridTop = gridOffset.top;

  var gridRight = grid.position.left + gridSize;
  var gridBottom = grid.position.top + gridSize;
  var oldLeft;
  var oldTop;
  var thisLeft;
  var thisTop;

// console.log("left grid offset", gridLeft);
// console.log("top grid offset", gridTop);
// console.log("tile size", tileSize);

  $('.ship').draggable({
    start: function(event, ui) {
      oldLeft = ui.offset.left;
      oldTop = ui.offset.top;
    },
    stop: function(event, ui) {
      thisLeft = ui.offset.left;
      //console.log("ship released. offset left is",thisLeft);
      thisTop = ui.offset.top;
      //console.log("offset top is", thisTop);

      snapToTile($(this), thisLeft, thisTop);
    }
  });

//rotate ship
  $('.ship').click(function() {
    var h = $(this).height();
    var w = $(this).width();
    $(this).height(w);
    $(this).width(h);
    $(this).toggleClass('rotated');
    var shipObj = getShipObject($(this));
    if (h > w) {
      shipObj.isRotated = true;
    } else {
      shipObj.isRotated = false;
    }
    console.log("ship obj.isRotated set to", shipObj.isRotated);
  });

//=========================
//===== SUBMIT BOARD ======
//=========================
//generate board array
  $('.submit').click(function() {
    console.log("submit clicked");
    var Tile = function(row, column, active, ship, hit) {
      this.row = row;
      this.column = column;
      this.active = active;
      this.ship = ship;
      this.hit = hit;
    };

    var boardArray = [];
    var r;
    var c;
    for (var u=1; u<=100; u++) {
      r = Math.ceil(u/10);
      c = u%10;
      if (c === 0) {
        c =10;
      }
      boardArray.push(new Tile(r, c, false, null, false));
    }

    function assignTiles() {
      var trow;
      var tcol;
      var tindex;
      for (var q in ships) {
        tcol = (ships[q].left/tileSize) + 1;
        trow = (ships[q].top/tileSize) + 1;
        //console.log("row and col found:", ships[q].name, trow, tcol);
        tindex = (trow-1)*10 + tcol -1;
        for (var l=0; l<ships[q].length; l++) {
          if (!ships[q].isRotated) {
            boardArray[tindex +(l*10)].active = true;
            boardArray[tindex +(l*10)].ship = ships[q].name;
            //console.log("setting tile index", tindex +(l*10), "to active:", boardArray[tindex +(l*10)]);
          } else {
            boardArray[tindex +(l)].active = true;
            boardArray[tindex +(l)].ship = ships[q].name;
            //console.log("setting tile index", tindex +(l), "to active:", boardArray[tindex +(l)]);
    } } } }

    assignTiles();
    // AT THIS POINT, BOARD ARRAY IS READY TO BE SUBMITTED!

    window.localStorage.gameBoard = JSON.stringify(boardArray);
    window.localStorage.ships = JSON.stringify(ships);
    console.log("saving board to local storage");
    console.log("board is", window.localStorage.gameBoard);

    // var socket = io('/');
    // socket.on('connect', function() {
    //   console.log("Connected to SOCKET");
    //   socket.emit("board_submitted", room, pnum);
      window.location = "/battleship/"+room;
    // });

  }); //close submit button call
} //close if auth check

// ============================
//          FUNCTIONS
// ============================
//SNAP HANDLER
function snapToTile(ship, thisLeft, thisTop) {
  var leftRelToGrid = thisLeft - gridLeft;
  var topRelToGrid = thisTop - gridTop;
  var newLeft = (Math.round(leftRelToGrid/30))*30;
  var newTop = (Math.round(topRelToGrid/30))*30;
  var shipobject = getShipObject(ship);
  if (placementIsValid(shipobject, newLeft+gridLeft, newTop+gridTop)) {
    ship.animate({
      left: newLeft + gridLeft,
      top: newTop + gridTop
    });
    shipobject.left = newLeft;
    shipobject.top = newTop;
  } else {
    ship.animate({
      left: oldLeft,
      top: oldTop
    });
  }
  // for (var b in ships) {
  //   console.log("SHIP",ships[b].name, ships[b].left, ships[b].top);
  // }
}
//RETURN SHIP OBJECT
function getShipObject(shipDiv) {
  for (var y in ships) {
    if (shipDiv.hasClass(ships[y].name)) {
      return ships[y];
} } }
//IF IS VALID PLACEMENT
function placementIsValid(ship, newLeft, newTop) {
  var leftRange;
  var topRange;
  // console.log("checking placement");
  if (!ship.isRotated) {
    leftRange = [gridLeft, gridLeft + 9*tileSize];
    topRange = [gridTop, gridTop + (10-ship.length)*tileSize];
  } else {
    leftRange = [gridLeft, gridLeft + (10-ship.length)*tileSize];
    topRange = [gridTop, gridTop + 9*tileSize];
  }
  if (newLeft >= leftRange[0] && newLeft <= leftRange[1] && newTop >= topRange[0] && newTop <= topRange[1]) {
    return true;
  } else {
    return false;
  } // console.log("ranges", leftRange, topRange);
}


}); //close document listener