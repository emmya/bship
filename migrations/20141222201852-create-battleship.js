"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Battleships", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      p1name: {
        type: DataTypes.STRING
      },
      p2name: {
        type: DataTypes.STRING
      },
      p1socket: {
        type: DataTypes.STRING
      },
      p2socket: {
        type: DataTypes.STRING
      },
      p1ready: {
        type: DataTypes.BOOLEAN
      },
      p2ready: {
        type: DataTypes.BOOLEAN
      },
      p1reconnect: {
        type: DataTypes.BOOLEAN
      },
      p2reconnect: {
        type: DataTypes.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Battleships").done(done);
  }
};