const mysql = require('mysql2');

// Create the connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'adminjpf',
    password: 'adminjpf123',
    database: 'feur_admin_db'
});

// Test the connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully!');
    
    // Test query
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.log('Tables in database:', results);
        
        // Close the connection
        connection.end();
    });
}); 