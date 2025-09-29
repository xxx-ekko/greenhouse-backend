// backend/controllers/measurementController.js
const { Measurement } = require('../models');

exports.createMeasurement = async (req, res) => {
  // L'ID du capteur vient du middleware apiKeyAuth (req.sensor.id)
  const sensorId = req.sensor.id;
  // Les données (température, humidité, etc.) sont le corps de la requête
  const data = req.body;

  if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'A valid JSON body is required.' });
  }

  try {
    // On utilise Sequelize pour créer la nouvelle mesure
    const newMeasurement = await Measurement.create({
      sensorId, // Sequelize associe à la bonne clé étrangère
      data,
    });

    res.status(201).json(newMeasurement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};