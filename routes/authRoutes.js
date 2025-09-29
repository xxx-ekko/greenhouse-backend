// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Route pour l'inscription : POST /api/auth/register
router.post('/register', authController.register);

// Route pour la connexion : POST /api/auth/login
router.post('/login', authController.login);

// Route protégée
router.get('/profile', auth, authController.getProfile);

module.exports = router;