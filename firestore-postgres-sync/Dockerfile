# Dockerfile
FROM node:18

WORKDIR /usr/src/app

# Installation des dépendances globales
RUN apt-get update && apt-get install -y postgresql-client

# Copie des fichiers de configuration
COPY package*.json ./
COPY .env ./
COPY firebase-credentials.json ./

# Installation des dépendances Node.js
RUN npm install
RUN npm install -g firebase-tools
RUN npm install firebase pg dotenv

# Copie du code source
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY sql/ ./sql/

# Rendre les scripts exécutables
RUN chmod +x ./scripts/startup.sh

# Point d'entrée
ENTRYPOINT ["./scripts/startup.sh"]
