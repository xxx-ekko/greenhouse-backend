const { Pool } = require('pg');

// Créer un "pool" de connexions.
// Un pool est plus efficace qu'une simple connexion car il gère
// et réutilise plusieurs connexions pour ne pas saturer la base de données.
const pool = new Pool({
  user: 'ekko', 
  host: 'localhost',
  database: 'greenhouse_db', 
  password: '',
  port: 5432, 
});

// On exporte une méthode 'query' qui utilise le pool pour exécuter des requêtes
module.exports = {
  query: (text, params) => pool.query(text, params),
};