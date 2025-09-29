'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Un utilisateur peut avoir plusieurs capteurs
      User.hasMany(models.Sensor, {
      foreignKey: 'userId',
      as: 'sensors',
  });
    }
  }
  User.init({

    email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

    password_hash: { 
    type: DataTypes.STRING,
    allowNull: false
    }
    
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};