
Battleship!!!

I made dis. It hosts multiplayer battleship games. 

Built with Node, Sequelize, Postgres, and Socket.io which is awesome. (See http://http://socket.io)

Complete:
  Waiting room - see other connected users, send/accept game invitations, customize player name
  Setup - drag and drop ships, rotation on click, snap to grid. All of this is custom JS as I couldn't find anything that worked.
  Gameplay - shoot opponent boards and get responses. Be updated on hits, misses, sinks. List completed hits. Know when a user has won.
  The big thing: Users can quit, refresh, and revisit active games and they will be reloaded/reconnected beautifully. Players know if their opponent is disconnected.
  
Coming soon:
  Better aesthetic... it needs to look cool.
  Little bug checks: prohibit duplicate invites, overlapping ships during setup, etc.
  Clearer information during gameplay. Know which ships your opponent has sunk.
  Animations. Explosions. Obviously
  And maybe... a 'battleshots' version for the friends. 

To initialize dev server:
npm install
sequelize init
config database (run postgres, createdb, update config.json)

