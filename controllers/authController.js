// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // On importe le modèle User depuis le dossier models

// Logique pour l'inscription
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    // Utilisation de Sequelize pour créer un nouvel utilisateur
    const newUser = await User.create({
      email,
      password_hash,
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    // Sequelize renvoie une erreur de type 'SequelizeUniqueConstraintError' pour les doublons
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Logique pour la connexion
exports.login = async (req, res) => {
    const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Utilisation de Sequelize pour trouver un utilisateur par son email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


//Logique liée à l'authentification et aux utilisateurs
exports.getProfile = async (req, res) => {
  try {
    // req.user.id est ajouté par le middleware 'auth' que nous appliquerons dans le fichier de routes
    const userId = req.user.id;

    // On utilise Sequelize pour trouver l'utilisateur par sa clé primaire (Primary Key)
    const user = await User.findByPk(userId, {
      // On spécifie les champs à retourner pour ne jamais inclure le hash du mot de passe
      attributes: ['id', 'email', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};