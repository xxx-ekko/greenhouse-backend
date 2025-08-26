//backend/index.js
require('dotenv').config();

const apiKeyAuth = require('./middleware/apiKeyAuth');
const express = require('express');
const db = require('./database.js'); // Our database module
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// --- SETUP MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- REGISTRATION ROUTE ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 2. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insert the new user into the database
    const queryText = 'INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING id, email';
    const { rows } = await db.query(queryText, [email, password_hash]);

    // 4. Send back a success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: rows[0],
    });

  } catch (err) {
    // Handle specific errors, like a duplicate email
    if (err.code === '23505') { // PostgreSQL's unique violation error code
      return res.status(409).json({ message: 'Email already exists.' });
    }
    // Handle other potential errors
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 2. Find the user in the database
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = rows[0];

    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Create and sign the JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 5. Send the token to the client
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- AUTHENTICATION ROUTE ---
// The 'auth' middleware runs before the (req, res) handler
app.get('/api/profile', auth, async (req, res) => {
  try {
    // The user's id is attached to req.user by the auth middleware
    const userId = req.user.id;

    // Fetch user's non-sensitive data from the database
    const { rows } = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- SENSOR ROUTES ---

// @route   POST /api/sensors
// @desc    Add a new sensor for a logged-in user
// @access  Private (requires a token)
app.post('/api/sensors', auth, async (req, res) => {
  // The user's ID is available from the 'auth' middleware (req.user.id)
  const userId = req.user.id;
  const { name, type, location } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ message: 'Sensor name is required.' });
  }

    // Generate a new unique API key
    const apiKey = crypto.randomBytes(16).toString('hex');

  try {
    const queryText = `
      INSERT INTO sensors (user_id, name, type, location, api_key)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userId, name, type, location, apiKey];

    const { rows } = await db.query(queryText, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sensors
// @desc    Get all sensors for a logged-in user
// @access  Private
app.get('/api/sensors', auth, async (req, res) => {
  try {
    // Get the user ID from the token via our auth middleware
    const userId = req.user.id;

    const queryText = 'SELECT * FROM sensors WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await db.query(queryText, [userId]);

    // It's okay if the array is empty, it just means the user has no sensors yet
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- MEASUREMENTS ROUTES ---

// @route   POST /api/measurements
// @desc    Receive a new measurement from an authenticated sensor
// @access  Private (requires API Key)
app.post('/api/measurements', apiKeyAuth, async (req, res) => {
  // The sensor ID now comes securely from the middleware after it validates the API key.
  const sensor_id = req.sensor.id;
  const { temperature, humidity } = req.body;

  // Basic validation for the incoming data
  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ message: 'Temperature and humidity are required.' });
  }

  try {
    const queryText = `
      INSERT INTO measurements (sensor_id, temperature, humidity)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [sensor_id, temperature, humidity];
    const { rows } = await db.query(queryText, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/sensors/:id/measurements
// @desc    Get the latest measurements for a specific sensor
// @access  Private
app.get('/api/sensors/:id/measurements', auth, async (req, res) => {
  try {
    const { id: sensorId } = req.params; // Get sensorId from the URL parameter

    // First, verify this sensor belongs to the logged-in user
    const sensorCheck = await db.query(
      'SELECT * FROM sensors WHERE id = $1 AND user_id = $2',
      [sensorId, req.user.id]
    );

    if (sensorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Sensor not found or access denied.' });
    }

    // If check passes, get the measurements
    const queryText = `
      SELECT * FROM measurements 
      WHERE sensor_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 20`;
    const { rows } = await db.query(queryText, [sensorId]);

    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server backend démarré sur http://localhost:${PORT}`);
});