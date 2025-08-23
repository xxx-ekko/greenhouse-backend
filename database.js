const { Pool } = require('pg');

// Créer un "pool" de connexions.
// Le pool de connexions va maintenant lire sa configuration
// directement depuis les variables d'environnement (process.env)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// On exporte une méthode 'query' qui utilise le pool pour exécuter des requêtes
module.exports = {
  query: (text, params) => pool.query(text, params),
};