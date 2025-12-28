const { Pool, Client } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log("Something went wrong when connecting to the database", err);
    } else {
        console.log("Established a connection to the database");
    }
});

module.exports = pool;

