const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.config');

const JWT_SECRET = process.env.JWT_SECRET || 'pokemon-ev-trainer-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

// Register a new user
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validation
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Email, username, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }

        // Check if email or username already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email.toLowerCase(), username.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email.toLowerCase(), username.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token
        });
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: 'Failed to register user' });
    }
};

// Login user
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT id, email, username, password_hash FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token
        });
    } catch (err) {
        console.error('Error logging in:', err);
        return res.status(500).json({ error: 'Failed to login' });
    }
};

// Get current user info
module.exports.me = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const result = await pool.query(
            'SELECT id, email, username, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Export JWT_SECRET for middleware
module.exports.JWT_SECRET = JWT_SECRET;
