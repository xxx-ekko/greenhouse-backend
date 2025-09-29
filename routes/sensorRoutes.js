// backend/routes/sensorRoutes.js
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const auth = require('../middleware/auth'); // On a besoin du middleware pour protéger les routes

// Route pour lister tous les capteurs et en créer un nouveau
router.route('/')
  .get(auth, sensorController.getAllSensors)
  .post(auth, sensorController.createSensor);

// Routes pour modifier et supprimer un capteur
router.route('/:id')
  .put(auth, sensorController.updateSensor)     
  .delete(auth, sensorController.deleteSensor);

// Route pour récupérer les mesures d'un capteur spécifique
router.get('/:id/measurements', auth, sensorController.getSensorMeasurements);

module.exports = router;