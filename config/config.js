// backend/config/config.js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },
  test: {
    // Configuration pour un environnement de test 
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    // Options spécifiques à la production 
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Cette option peut être nécessaire selon l'hébergeur de ta BDD
      }
    }
  }
};