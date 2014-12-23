"use strict";
module.exports = function(sequelize, DataTypes) {
  var Battleship = sequelize.define("Battleship", {
    p1name: DataTypes.STRING,
    p2name: DataTypes.STRING,
    p1socket: DataTypes.STRING,
    p2socket: DataTypes.STRING,
    p1ready: DataTypes.BOOLEAN,
    p2ready: DataTypes.BOOLEAN,
    p1reconnect: DataTypes.BOOLEAN,
    p2reconnect: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Battleship;
};