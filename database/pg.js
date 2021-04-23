const  { Pool } = require('pg');

require('dotenv').config();

const connectionString = `postgres://${process.env.PG_DB_USER}:${process.env.PG_DB_PASSWORD}@${process.env.pG_DB_HOST}:${process.env.PG_DB_PORT}/${process.env.PG_DB_DATABASE}`;

exports.pool = new Pool({
    connectionString: connectionString 
})
