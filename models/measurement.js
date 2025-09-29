'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Measurement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Une mesure appartient à un capteur
      Measurement.belongsTo(models.Sensor, {
      foreignKey: 'sensorId',
      as: 'sensor',
  });
    }
  }
  Measurement.init({
    data: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Measurement',
  });
  return Measurement;
};