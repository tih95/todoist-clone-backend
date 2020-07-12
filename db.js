const Pool = require('pg').Pool;
const config = require('./config');

const pool = new Pool({
  user: config.PG_USER,
  password: config.PG_PASSWORD,
  database: config.PG_DATABASE,
  host: config.PG_HOST,
  port: config.PG_PORT
})

module.exports = pool;