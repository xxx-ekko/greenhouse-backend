'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sensor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Un capteur appartient à un utilisateur
      Sensor.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
       // Un capteur peut avoir plusieurs mesures
       Sensor.hasMany(models.Measurement, {
       foreignKey: 'sensorId',
       as: 'measurements',
    });
    }
  }
  Sensor.init({
    name: DataTypes.STRING,
    api_key: DataTypes.TEXT,
    type: DataTypes.STRING,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sensor',
  });
  return Sensor;
};