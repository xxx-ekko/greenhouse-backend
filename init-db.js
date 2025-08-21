// Import our database connection configuration
const db = require('./database.js');

const initDB = async () => {
  // The SQL command to create the table.
  // "IF NOT EXISTS" prevents an error if we run the script multiple times.
  const queries = [
  // --- Users Table ---
  `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,

      // --- Sensors Table ---
  `CREATE TABLE IF NOT EXISTS sensors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      api_key TEXT UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50),
      location VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,

    // --- Measurements Table ---
    `CREATE TABLE IF NOT EXISTS measurements (
      id BIGSERIAL PRIMARY KEY,
      sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
      temperature NUMERIC(5, 2),
      humidity NUMERIC(5, 2),
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  ];

    // Execute the query
  try {
    for (const query of queries) {
      await db.query(query);
    }
    console.log('Database tables created successfully or already exist. ✅');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
};

// Run the function
initDB();