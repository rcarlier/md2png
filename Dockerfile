# Utiliser une image Node.js officielle
FROM node:18-bullseye-slim

# Installer Chromium uniquement
RUN apt-get update && apt-get install -y chromium && rm -rf /var/lib/apt/lists/*

# Définir Chromium comme navigateur pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium


# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier package.json et package-lock.json (si disponible)
COPY package*.json ./

COPY app.js ./
COPY static/ ./static/

# Installer les dépendances
RUN npm install --production

# Copier les fichiers source
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "app.js"]