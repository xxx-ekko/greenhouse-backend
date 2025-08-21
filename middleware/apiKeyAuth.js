// backend/middleware/apiKeyAuth.js
const db = require('../database');

const apiKeyAuth = async (req, res, next) => {
  // Get the API key from a custom header
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ message: 'API Key required.' });
  }

  try {
    const queryText = 'SELECT * FROM sensors WHERE api_key = $1';
    const { rows } = await db.query(queryText, [apiKey]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid API Key.' });
    }

    // Attach the sensor object to the request for later use
    req.sensor = rows[0];
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = apiKeyAuth;