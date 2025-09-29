// backend/middleware/apiKeyAuth.js
const { Sensor } = require('../models');
//const db = require('../database');

const apiKeyAuth = async (req, res, next) => {
  // Get the API key from a custom header
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ message: 'API Key required.' });
  }

  try {
    // On utilise Sequelize pour trouver UN capteur qui a cette clé d'API
    const sensor = await Sensor.findOne({ where: { api_key: apiKey } });

    if (!sensor) {
      return res.status(401).json({ message: 'Invalid API Key.' });
    }

    // Attach the sensor object to the request for later use
    req.sensor = sensor;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = apiKeyAuth;