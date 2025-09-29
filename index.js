//backend/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');


const app = express();
const PORT = 3001;

// --- SETUP MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// On importe et on utilise nos fichiers de routes
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const measurementRoutes = require('./routes/measurementRoutes');

// On dit à Express d'utiliser chaque routeur pour le bon chemin de base
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/measurements', measurementRoutes);



app.listen(PORT, () => {
  console.log(`Server backend démarré sur http://localhost:${PORT}`);
});