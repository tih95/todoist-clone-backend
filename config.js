require('dotenv').config();

const PORT = process.env.PORT;
const PG_PORT = process.env.PG_PORT;
const PG_DATABASE = process.env.PG_DATABASE;
const PG_USER = process.env.PG_USER;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_HOST = process.env.PG_HOST;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  PORT,
  PG_PORT,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  PG_HOST,
  JWT_SECRET
}