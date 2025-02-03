// dataGenerator.js
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const postgresConfig = require('../config/postgres.config');

// Configuration
const INSERT_INTERVAL = 5000; // 5 secondes en milliseconds

// Initialiser la connexion PostgreSQL
const pool = new Pool(postgresConfig);

// Fonction pour générer des données aléatoires
function generateRandomData() {
    return {
        id: uuidv4(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
    };
}

// Fonction pour insérer les données
async function insertData() {
    const data = generateRandomData();
    
    try {
        const query = `
            INSERT INTO firestore_data (id, name, email)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [data.id, data.name, data.email];
        
        const result = await pool.query(query, values);
        console.log('Données insérées:', result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de l\'insertion:', error);
    }
}

// Démarrer l'insertion périodique
function startPeriodicInsert(interval = INSERT_INTERVAL) {
    console.log(`Démarrage de l'insertion périodique (toutes les ${interval/1000} secondes)...`);
    
    // Première insertion immédiate
    insertData();
    
    // Insertions suivantes à intervalle régulier
    setInterval(insertData, interval);
}

// Gestion des erreurs de connexion
pool.on('error', (err) => {
    console.error('Erreur de connexion PostgreSQL:', err);
    process.exit(-1);
});

// Démarrer le générateur
startPeriodicInsert();