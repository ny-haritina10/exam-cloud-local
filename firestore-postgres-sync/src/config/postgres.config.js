const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const postgresConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  // host: process.env.PG_HOST_DOCKER,  
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

module.exports = postgresConfig;