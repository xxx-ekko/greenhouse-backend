// backend/routes/measurementRoutes.js
const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const apiKeyAuth = require('../middleware/apiKeyAuth'); // Le middleware pour l'authentification par clé d'API

// Route pour recevoir une nouvelle mesure
// POST /api/measurements
router.post('/', apiKeyAuth, measurementController.createMeasurement);

module.exports = router;