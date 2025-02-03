#!/bin/bash
set -e

# Initialisation de Firebase avec le service account
echo "Initialisation de Firebase..."
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-credentials.json"

# Démarrer l'application
echo "Démarrage de l'application..."
node src/sync.js