CREATE TABLE firestore_data (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    mdp VARCHAR(255),
    email VARCHAR(255),
    date_naissance TIMESTAMP
);

CREATE TABLE transaction (
    id VARCHAR(255) PRIMARY KEY,
    montant decimal (15,2),
    date_transaction date,
    id_users VARCHAR(255) references users(id)
)