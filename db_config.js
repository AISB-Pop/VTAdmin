const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',  // Using the password from your server.js
    database: 'feur_admin_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool query into promises
const promisePool = pool.promise();

module.exports = promisePool; 