
 // ============
 // This file handles the waiting room and game invitations.
 // =============

document.addEventListener("DOMContentLoaded", function(event) {

  console.log("Starting JavaScript.");

//name set up
  var name;
  if (window.localStorage.name) {
    name = window.localStorage.name;
    console.log(name);
  } else {
    var rand = Math.floor((Math.random()*200));
    console.log(rand);
    name = "guest"+rand.toString();
    window.localStorage.name = name;
  }
  document.title = name;

// ===================
//      list init
// ===================
  var socket = io('/home');
  var onlineList = [];
//upon page load, calls 'connect' in server with name
  socket.on('connect', function() {
    socket.emit('adduser', name);
  });
//appends all usernames to list
  socket.on('update', function(users) {
    onlineList = users;
    $('#users').empty();
    if (onlineList.length <= 1) {
      $('#users').append("no others online");
    }
    for(var i=0; i<onlineList.length; i++) {
      if (onlineList[i].name !== name) {
        $('#users').append("<li class='userItem' id='"+i+"'>" + onlineList[i].name + "</li>");
      }
    }
  });

// ===================
//    update name
// ===================
  $('.submitName').click(function() {
    var newName = $('.name').val();
    if (newName.length >= 3) {
      window.localStorage.name = newName;
    } else {
      alert("please choose a name with 3 or more characters");
    }
  });

// ===================
//    send invite
// ===================
//adds click listener to list of users
  $(document).on('click', '.userItem', function(e) {
    var targetIndex = parseInt(e.target.id);
    var targetSocket = getSocketByIndex(targetIndex, onlineList);
    var senderSocket = getOwnSocket(name, onlineList);
    resetLocalStorage();
    socket.emit('invite', targetSocket, senderSocket);
  });

// ===================
//   receive invite
// ===================
//appends game invitation
  socket.on('receive_invitation', function(senderSocket) {
    var sender = getNameBySocket(senderSocket, onlineList);
    $('.messages').append("<div class='message' id='"+sender+"'>Accept invite sent by "+sender+"?");
  });
//invitation click listener
  $(document).on('click', '.messages', function(e) {
    var senderName = e.target.id;
    var inviterSocket = getSocketByName(senderName, onlineList);
    var inviteeSocket = getOwnSocket(name, onlineList);
//At some point, can add a check here if a user is about to clear
//their current locally stored game
    resetLocalStorage();
    socket.emit('accept_invite', inviterSocket, inviteeSocket, senderName, name);
  });

// ===================
//    game redirect
// ===================
//invite accepter is p2 and it will be their turn first
  socket.on('setup_redirect', function(gameId, role) {
    if (role === "p2") {
      window.localStorage.isYourTurn = "true";
    } else {
      window.localStorage.isYourTurn = "false";
    }
    window.localStorage.gameNumber = gameId.toString();
    console.log('redirecting to game #'+gameId+
      ". Your role is", role,
      ", and isYourTurn is", window.localStorage.isYourTurn);
    window.location = "/battleship/setup/"+gameId.toString();
  });

// ===================
//      functions
// ===================
//functions to fetch data from onlineList
  function getSocketByIndex(index, list) {
    console.log("recipient socket is", list[index].socket);
    return list[index].socket;
  }
  function getOwnSocket(name, list) {
    for (var usr in list) {
      if (list[usr].name === name) {
        console.log("sender socket is", list[usr].socket);
        return list[usr].socket;
      }
    } return false;
  }
  function getNameBySocket(sockID, list) {
    for (var usr in list) {
      if (list[usr].socket === sockID) {
        return list[usr].name;
      }
    } return false;
  }
  function getSocketByName(name, list) {
    for (var usr in list) {
      if (list[usr].name === name) {
        return list[usr].socket;
      }
    } return false;
  }
// resets local storage. called upon game invite/acceptance
  function resetLocalStorage() {
    if (window.localStorage.gameBoard.length > 0) {
      window.localStorage.gameBoard = "";
      window.localStorage.hits = "";
      window.localStorage.ships = "";
      window.localStorage.opponentReady = "false";
      window.localStorage.shots = "";
      window.localStorage.gameNumber = "";
    }
  }


}); //closes document listener