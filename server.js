const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db_config');

const app = express();
const port = 3002;

// Configure CORS
app.use(cors({
    origin: '*', // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add test endpoint
app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Server is running!' });
});

// Add analytics endpoint
app.get('/api/analytics', async (req, res) => {
    try {
        // Get total users count from all tables
        const [[adminCount]] = await db.query('SELECT COUNT(*) as count FROM admins');
        const [[outsiderCount]] = await db.query('SELECT COUNT(*) as count FROM outsiders');
        const [[insiderCount]] = await db.query('SELECT COUNT(*) as count FROM insiders');
        
        // Get active sessions (currently logged in users)
        const [[activeSessions]] = await db.query(
            'SELECT COUNT(DISTINCT email) as count FROM login_attempts WHERE success = true AND attempt_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
        );
        
        // Get today's orders count
        const [[pendingOrders]] = await db.query(
            'SELECT COUNT(*) as count FROM orders WHERE status = "pending"'
        );
        
        // Get today's sales
        const [[todaySales]] = await db.query(
            'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = CURDATE() AND status != "cancelled"'
        );

        res.json({
            success: true,
            totalUsers: adminCount.count + outsiderCount.count + insiderCount.count,
            activeSessions: activeSessions.count,
            todaySales: todaySales.total,
            pendingOrders: pendingOrders.count
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Error fetching analytics data' });
    }
});

const SECRET_KEY = 'your_secret_key'; // Change this to a strong, secret key

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role_id ENUM('admin', 'superadmin') NOT NULL,
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Admins table created successfully');

    // Create outsiders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS outsiders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Outsiders table created successfully');

    // Create insiders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS insiders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        birthday DATE NOT NULL,
        age INT NOT NULL,
        gender VARCHAR(20) NOT NULL,
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Insiders table created successfully');

    // Create default superadmin if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.query(`
      INSERT IGNORE INTO admins (username, email, password_hash, role_id, status)
      SELECT 'Super Admin', 'superadmin@feuroosevelt.edu.ph', ?, 'superadmin', 'active'
      FROM dual
      WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'superadmin@feuroosevelt.edu.ph')
    `, [hashedPassword]);
    console.log('Superadmin account ready');

  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database
initializeDatabase();

// User signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, accountType, contact_number, birthday, age, gender } = req.body;
    
    // Validate required fields
    if (!email || !password || !contact_number) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate contact number
    if (!/^\d{11}$/.test(contact_number)) {
      return res.status(400).json({ success: false, message: 'Invalid contact number format' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate username from email
    const username = email.split('@')[0];
    
    // Insert user into appropriate table based on account type
    let result;
    if (accountType === 'personal') { // Outsider
      [result] = await db.query(
        'INSERT INTO outsiders (username, email, password_hash, contact_number) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, contact_number]
      );
    } else { // Insider
      // Validate additional required fields for insiders
      if (!birthday || !age || !gender) {
        return res.status(400).json({ success: false, message: 'Missing required fields for insider account' });
      }
      
      [result] = await db.query(
        'INSERT INTO insiders (username, email, password_hash, contact_number, birthday, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, contact_number, birthday, age, gender]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Error creating user: ' + error.message });
    }
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check all tables for the user
    const [admins] = await db.query('SELECT *, "admin" as user_type FROM admins WHERE email = ?', [email]);
    const [outsiders] = await db.query('SELECT *, "outsider" as user_type FROM outsiders WHERE email = ?', [email]);
    const [insiders] = await db.query('SELECT *, "insider" as user_type FROM insiders WHERE email = ?', [email]);
    
    const user = admins[0] || outsiders[0] || insiders[0];
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_id || user.user_type,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

// Get all users (admin/superadmin only)
app.get('/api/users', async (req, res) => {
  try {
    // Get users from all tables
    const [admins] = await db.query(
      'SELECT id, username, email, role_id as role, status, created_at, "admin" as user_type FROM admins'
    );
    
    const [outsiders] = await db.query(
      'SELECT id, username, email, contact_number, status, created_at, "outsider" as user_type FROM outsiders'
    );
    
    const [insiders] = await db.query(
      'SELECT id, username, email, contact_number, birthday, age, gender, status, created_at, "insider" as user_type FROM insiders'
    );
    
    // Combine all users
    const allUsers = [...admins, ...outsiders, ...insiders];
    
    res.json({ success: true, users: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Delete user (admin/superadmin only)
app.delete('/api/users/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let table;
    
    switch (type) {
      case 'admin':
        table = 'admins';
        break;
      case 'outsider':
        table = 'outsiders';
        break;
      case 'insider':
        table = 'insiders';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid user type' });
    }
    
    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Update user (admin/superadmin only)
app.put('/api/users/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { email, contact_number, birthday, age, gender, status } = req.body;
    
    let query;
    let params;
    
    switch (type) {
      case 'outsider':
        query = 'UPDATE outsiders SET email = ?, contact_number = ?, status = ? WHERE id = ?';
        params = [email, contact_number, status, id];
        break;
      case 'insider':
        query = 'UPDATE insiders SET email = ?, contact_number = ?, birthday = ?, age = ?, gender = ?, status = ? WHERE id = ?';
        params = [email, contact_number, birthday, age, gender, status, id];
        break;
      case 'admin':
        query = 'UPDATE admins SET email = ?, status = ? WHERE id = ?';
        params = [email, status, id];
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid user type' });
    }
    
    await db.query(query, params);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
