// backend/controllers/sensorController.js
const crypto = require('crypto');
const { Sensor, Measurement } = require('../models');

// --- Logique pour créer un capteur ---
exports.createSensor = async (req, res) => {
  const userId = req.user.id;
  const { name, type, location } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Sensor name is required.' });
  }

  try {
    const apiKey = crypto.randomBytes(16).toString('hex');

    // On utilise Sequelize pour créer le capteur
    const newSensor = await Sensor.create({
      userId, 
      name,
      type,
      location,
      api_key: apiKey,
    });

    res.status(201).json(newSensor);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// --- Logique pour modifier un capteur ---
exports.updateSensor = async (req, res) => {
  const userId = req.user.id;
  const { id: sensorId } = req.params;
  const { name, type, location } = req.body;

  try {
    // On cherche le capteur en s'assurant qu'il appartient bien à l'utilisateur connecté
    const sensor = await Sensor.findOne({ where: { id: sensorId, userId } });

    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    // On met à jour le capteur avec les nouvelles données
    sensor.name = name || sensor.name;
    sensor.type = type || sensor.type;
    sensor.location = location || sensor.location;
    await sensor.save();

    res.json(sensor);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// --- Logique pour supprimer un capteur ---
exports.deleteSensor = async (req, res) => {
  const userId = req.user.id;
  const { id: sensorId } = req.params;

  try {
    // On utilise la méthode destroy de Sequelize, en s'assurant toujours
    // que l'utilisateur ne peut supprimer que ses propres capteurs.
    const result = await Sensor.destroy({
      where: {
        id: sensorId,
        userId,
      },
    });

    // destroy renvoie le nombre de lignes supprimées. Si c'est 0, le capteur n'a pas été trouvé.
    if (result === 0) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    res.json({ message: 'Sensor removed successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// --- Logique pour lister tous les capteurs d'un utilisateur ---
exports.getAllSensors = async (req, res) => {
  const userId = req.user.id;
  try {
    // On utilise Sequelize pour trouver tous les capteurs avec le bon userId
    const sensors = await Sensor.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(sensors);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// --- Logique pour récupérer les mesures d'un capteur spécifique ---
exports.getSensorMeasurements = async (req, res) => {
    const userId = req.user.id;
    const { id: sensorId } = req.params;
    try {
        
        const sensor = await Sensor.findOne({ where: { id: sensorId, userId } });
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor not found or access denied.' });
        }

        
        const measurements = await Measurement.findAll({
            where: { sensorId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json(measurements);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};