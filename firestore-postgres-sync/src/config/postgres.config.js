const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const postgresConfig = {
  user: process.env.PG_USER,
  host: 'postgres',
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

module.exports = postgresConfig;