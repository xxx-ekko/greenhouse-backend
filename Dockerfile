# Étape 1: Choisir notre image de base
FROM node:22-alpine

# Étape 2: Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3: Copier les fichiers de dépendances et les installer
COPY package*.json ./
RUN npm install --only=production

# Étape 4: Copier le reste du code de l'application
COPY . .

# Étape 5: Exposer le port sur lequel l'application tourne
EXPOSE 3001

# Étape 6: Définir la commande pour démarrer l'application
CMD [ "node", "index.js" ]
