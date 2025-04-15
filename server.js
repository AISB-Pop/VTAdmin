import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
        console.log('Received:', message);
        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

const port = 3002;

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Generate nonce for each request
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// Middleware - Configure all security headers
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            "default-src": ["'self'"],
            "script-src": [
                "'self'",
                (req, res) => `'nonce-${res.locals.nonce}'`,
                "https://cdn.jsdelivr.net"
            ],
            "style-src": [
                "'self'",
                (req, res) => `'nonce-${res.locals.nonce}'`
            ],
            "img-src": ["'self'"],
            "connect-src": ["'self'", "https://api.emailjs.com"],
            "font-src": ["'self'"],
            "object-src": ["'none'"],
            "media-src": ["'none'"],
            "frame-src": ["'none'"],
            "frame-ancestors": ["'none'"],
            "form-action": ["'self'"],
            "base-uri": ["'self'"],
            "manifest-src": ["'none'"],
            "upgrade-insecure-requests": []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false
}));

// Configure CORS
app.use(cors({
    origin: true, // Allow all origins temporarily for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
}));

// Add security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Add Cache-Control headers
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

app.use(express.json());
app.use(express.static('public', {
    setHeaders: (res, path) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        const csp = res.getHeader('Content-Security-Policy');
        if (csp) {
            res.setHeader('Content-Security-Policy', csp);
        }
    }
}));

// Serve login-signup page dynamically
app.get('/login-signup', (req, res) => {
    res.render('login-signup', { nonce: res.locals.nonce });
});

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'feur_admin_db',
    port: 3306
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Create tables if they don't exist
const createTables = async () => {
    try {
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                ip_address VARCHAR(45),
                status VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_agent TEXT
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS banned_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                reason TEXT,
                banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                banned_until TIMESTAMP NULL,
                banned_by VARCHAR(255)
            )
        `);

        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Security tables created successfully');
    } catch (error) {
        console.error('Error creating security tables:', error);
    }
};

// Call createTables when server starts
createTables();

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
        await logLoginAttempt('MISSING_CREDENTIALS', email, ipAddress, userAgent);
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }

    try {
        const [bannedUser] = await db.promise().query(
            'SELECT * FROM banned_users WHERE email = ? AND (banned_until IS NULL OR banned_until > NOW())',
            [email]
        );

        if (bannedUser.length > 0) {
            await logLoginAttempt('BANNED', email, ipAddress, userAgent);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const [outsiders] = await db.promise().query(
            'SELECT * FROM outsiders WHERE email = ?',
            [email]
        );

        if (outsiders.length > 0) {
            const user = outsiders[0];
            if (!user.password_hash) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User account error: No password set. Please reset your password.' 
                });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (validPassword) {
                await db.promise().query(
                    'INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)',
                    [email, 'LOGIN', 'User logged in successfully']
                );

                return res.json({
                    success: true,
                    user: {
                        email: user.email,
                        role: 'outsider'
                    }
                });
            }

            await logLoginAttempt('FAILED', email, ipAddress, userAgent);
        }

        const [insiders] = await db.promise().query(
            'SELECT * FROM insiders WHERE email = ?',
            [email]
        );

        if (insiders.length > 0) {
            const user = insiders[0];
            if (!user.password_hash) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User account error: No password set. Please reset your password.' 
                });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (validPassword) {
                await db.promise().query(
                    'INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)',
                    [email, 'LOGIN', 'User logged in successfully']
                );

                return res.json({
                    success: true,
                    user: {
                        email: user.email,
                        role: 'insider'
                    }
                });
            }

            await logLoginAttempt('FAILED', email, ipAddress, userAgent);
        }

        await logLoginAttempt('USER_NOT_FOUND', email, ipAddress, userAgent);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    } catch (error) {
        await logLoginAttempt('ERROR', email, ipAddress, userAgent);
        return res.status(500).json({
            success: false,
            message: 'An error occurred'
        });
    }
});

// Helper function for logging login attempts
async function logLoginAttempt(status, email, ipAddress, userAgent) {
    try {
        await db.promise().query(
            'INSERT INTO login_attempts (email, ip_address, status, user_agent) VALUES (?, ?, ?, ?)',
            [email || 'unknown', ipAddress, status, userAgent]
        );
    } catch (err) {}
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { email, password, accountType, contact_number, birthday, age, gender } = req.body;

    if (!email || !password || !accountType) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email, password, and account type are required' 
        });
    }

    if (accountType === 'insider' && (!contact_number || !birthday || !age || !gender)) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required for insider account' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const table = accountType === 'outsider' ? 'outsiders' : 'insiders';

        if (accountType === 'outsider') {
            await db.promise().query(
                'INSERT INTO outsiders (email, password_hash, contact_number) VALUES (?, ?, ?)',
                [email, hashedPassword, contact_number || null]
            );
        } else {
            await db.promise().query(
                'INSERT INTO insiders (email, password_hash, contact_number, birthday, age, gender) VALUES (?, ?, ?, ?, ?, ?)',
                [email, hashedPassword, contact_number, birthday, age, gender]
            );
        }

        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Email already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Server error during signup' });
        }
    }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [outsiderResult] = await db.promise().query(
            'UPDATE outsiders SET password_hash = ? WHERE email = ?',
            [hashedPassword, email]
        );

        const [insiderResult] = await db.promise().query(
            'UPDATE insiders SET password_hash = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (outsiderResult.affectedRows > 0 || insiderResult.affectedRows > 0) {
            res.json({ success: true, message: 'Password reset successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during password reset' });
    }
});

// Test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [result] = await db.promise().query('SELECT DATABASE() as db');
        res.json({ success: true, database: result[0].db });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to connect to database' });
    }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
    try {
        const [outsidersCount] = await db.promise().query('SELECT COUNT(*) as count FROM outsiders');
        const [insidersCount] = await db.promise().query('SELECT COUNT(*) as count FROM insiders');
        const totalUsers = outsidersCount[0].count + insidersCount[0].count;

        const analyticsData = {
            success: true,
            totalUsers: totalUsers,
            activeSessions: Math.floor(Math.random() * 50) + 10,
            todaySales: Math.floor(Math.random() * 10000),
            pendingOrders: Math.floor(Math.random() * 20)
        };

        res.json(analyticsData);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during analytics' 
        });
    }
});

// Analytics dashboard endpoint
app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const [outsidersCount] = await db.promise().query('SELECT COUNT(*) as count FROM outsiders');
        const [insidersCount] = await db.promise().query('SELECT COUNT(*) as count FROM insiders');
        const totalUsers = outsidersCount[0].count + insidersCount[0].count;

        const analyticsData = {
            success: true,
            totalUsers: totalUsers,
            activeSessions: Math.floor(Math.random() * 50) + 10,
            todaySales: Math.floor(Math.random() * 10000),
            pendingOrders: Math.floor(Math.random() * 20),
            avgSessionDuration: Math.floor(Math.random() * 30) + 5,
            avgProcessingTime: Math.floor(Math.random() * 10) + 2,
            usersTrend: Math.floor(Math.random() * 20) - 10,
            salesToday: Math.floor(Math.random() * 5000)
        };

        res.json(analyticsData);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during analytics' 
        });
    }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
    try {
        const [outsiders] = await db.promise().query('SELECT * FROM outsiders');
        const [insiders] = await db.promise().query('SELECT * FROM insiders');
        
        const users = [
            ...outsiders.map(user => ({ ...user, role: 'outsider' })),
            ...insiders.map(user => ({ ...user, role: 'insider' }))
        ];

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during users fetch' 
        });
    }
});

// Get single user endpoint
app.post('/api/users/get', async (req, res) => {
    try {
        const { id } = req.body;
        const [outsider] = await db.promise().query(`
            SELECT 
                o.id,
                o.email,
                o.contact_number,
                'outsider' as role,
                CASE 
                    WHEN b.email IS NOT NULL THEN 'banned'
                    ELSE 'active'
                END as status
            FROM outsiders o
            LEFT JOIN banned_users b ON o.email = b.email AND (b.banned_until IS NULL OR b.banned_until > NOW())
            WHERE o.id = ?
        `, [id]);

        if (outsider.length === 0) {
            const [insider] = await db.promise().query(`
                SELECT 
                    i.id,
                    i.email,
                    i.contact_number,
                    i.birthday,
                    i.age,
                    i.gender,
                    'insider' as role,
                    CASE 
                        WHEN b.email IS NOT NULL THEN 'banned'
                        ELSE 'active'
                    END as status
                FROM insiders i
                LEFT JOIN banned_users b ON i.email = b.email AND (b.banned_until IS NULL OR b.banned_until > NOW())
                WHERE i.id = ?
            `, [id]);

            if (insider.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.json({
                success: true,
                user: insider[0]
            });
        }

        res.json({
            success: true,
            user: outsider[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details'
        });
    }
});

// User management endpoints
app.post('/api/users/update', async (req, res) => {
    try {
        const { id, username, email, role, status } = req.body;
        const table = role === 'outsider' ? 'outsiders' : 'insiders';
        await db.promise().query(
            `UPDATE ${table} SET email = ?, contact_number = ? WHERE id = ?`,
            [email, username, id]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during user update' 
        });
    }
});

app.post('/api/users/delete', async (req, res) => {
    try {
        const { userType, id } = req.body;
        const table = userType === 'outsider' ? 'outsiders' : 'insiders';
        await db.promise().query(
            `DELETE FROM ${table} WHERE id = ?`,
            [id]
        );
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during user deletion' 
        });
    }
});

// Security log endpoints
app.get('/api/security/login-attempts', async (req, res) => {
    try {
        const [attempts] = await db.promise().query(
            'SELECT id, email, ip_address, status, timestamp, user_agent FROM login_attempts ORDER BY id DESC LIMIT 100'
        );

        const processedAttempts = attempts.map(attempt => ({
            id: attempt.id,
            email: attempt.email || 'unknown',
            ip_address: attempt.ip_address || 'unknown',
            status: attempt.status || 'unknown',
            timestamp: attempt.timestamp,
            user_agent: attempt.user_agent || 'unknown'
        }));

        res.json({
            success: true,
            attempts: processedAttempts
        });
    } catch (error) {
        console.error('Error fetching login attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch login attempts',
            error: error.message
        });
    }
});

app.get('/api/security/banned-users', async (req, res) => {
    try {
        const [bannedUsers] = await db.promise().query(
            'SELECT id, email, reason, banned_by FROM banned_users WHERE banned_until IS NULL OR banned_until > NOW() ORDER BY id DESC'
        );

        res.json({
            success: true,
            bannedUsers: bannedUsers.map(user => ({
                id: user.id,
                email: user.email,
                reason: user.reason,
                banned_by: user.banned_by
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banned users'
        });
    }
});

app.get('/api/security/activity-logs', async (req, res) => {
    try {
        const [logs] = await db.promise().query(
            'SELECT id, user_email, action, details FROM activity_logs ORDER BY id DESC LIMIT 100'
        );

        res.json({
            success: true,
            logs: logs.map(log => ({
                id: log.id,
                user_email: log.user_email,
                action: log.action,
                details: log.details
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs'
        });
    }
});

// Ban user endpoint
app.post('/api/security/ban-user', async (req, res) => {
    const { email, reason, bannedUntil, bannedBy } = req.body;

    if (!email || !reason || !bannedBy) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    try {
        // Check if user is already banned
        const [existingBan] = await db.promise().query(
            'SELECT * FROM banned_users WHERE email = ? AND (banned_until IS NULL OR banned_until > NOW())',
            [email]
        );

        if (existingBan.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User is already banned'
            });
        }

        // Insert ban record
        await db.promise().query(
            'INSERT INTO banned_users (email, reason, banned_until, banned_by) VALUES (?, ?, ?, ?)',
            [email, reason, bannedUntil, bannedBy]
        );

        // Log the ban action
        await db.promise().query(
            'INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)',
            [email, 'USER_BANNED', `Banned by ${bannedBy}. Reason: ${reason}`]
        );

        res.json({
            success: true,
            message: 'User banned successfully'
        });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to ban user',
            error: error.message
        });
    }
});

// Unban user endpoint
app.post('/api/security/unban-user', async (req, res) => {
    const { email, unbannedBy } = req.body;

    try {
        await db.promise().query(
            'DELETE FROM banned_users WHERE email = ?',
            [email]
        );

        await db.promise().query(
            'INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)',
            [email, 'USER_UNBANNED', `Unbanned by ${unbannedBy}`]
        );

        res.json({
            success: true,
            message: 'User unbanned successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to unban user'
        });
    }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required to log the logout action'
        });
    }

    try {
        await db.promise().query(
            'INSERT INTO activity_logs (user_email, action, details) VALUES (?, ?, ?)',
            [email, 'LOGOUT', 'User logged out successfully']
        );

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to log logout action'
        });
    }
});

// CSP Report endpoint
app.post('/api/csp-report', (req, res) => {
    res.status(204).end();
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
