const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database.config');

const JWT_SECRET = process.env.JWT_SECRET || 'pokemon-ev-trainer-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRES_HOURS = 1;

// ============================================
// Input Sanitization Utilities
// ============================================

/**
 * Sanitize string input - removes dangerous characters and trims whitespace
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
        .slice(0, 255); // Limit length
};

/**
 * Validate and sanitize email
 */
const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    const sanitized = email.trim().toLowerCase().slice(0, 255);
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize username - only allow alphanumeric, underscores, and hyphens
 */
const sanitizeUsername = (username) => {
    if (typeof username !== 'string') return '';
    return username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 100);
};

/**
 * Validate password (don't sanitize, just validate)
 */
const validatePassword = (password) => {
    if (typeof password !== 'string') return { valid: false, error: 'Password is required' };
    if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    if (password.length > 128) return { valid: false, error: 'Password is too long' };
    return { valid: true };
};

/**
 * Generate secure random token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Register a new user
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Sanitize inputs
        const sanitizedEmail = sanitizeEmail(email);
        const sanitizedUsername = sanitizeUsername(username);

        // Validation
        if (!sanitizedEmail) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        if (!sanitizedUsername || sanitizedUsername.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Check if email or username already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [sanitizedEmail, sanitizedUsername]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [sanitizedEmail, sanitizedUsername, passwordHash]
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
        const { email, username, password } = req.body;
        
        // Accept either email or username field (for backwards compatibility and flexibility)
        const rawInput = email || username;

        // Validation
        if (!rawInput || !password) {
            return res.status(400).json({ error: 'Username/email and password are required' });
        }

        // Sanitize input - could be email or username
        const sanitizedInput = sanitizeString(rawInput).toLowerCase();

        if (!sanitizedInput) {
            return res.status(400).json({ error: 'Invalid username or email format' });
        }

        // Find user by email or username
        const result = await pool.query(
            'SELECT id, email, username, password_hash FROM users WHERE email = $1 OR username = $1',
            [sanitizedInput]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username/email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username/email or password' });
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

// Request password reset - generates a reset token
module.exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);

        if (!sanitizedEmail) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT id, email, username FROM users WHERE email = $1',
            [sanitizedEmail]
        );

        // Always return success message to prevent email enumeration attacks
        // But only actually create token if user exists
        if (result.rows.length === 0) {
            // Return success to prevent revealing if email exists
            return res.status(200).json({ 
                message: 'If an account with that email exists, a reset token has been generated',
                // In a real app, you would NOT return a token here - you'd send an email
                // For demo purposes without email service, we return nothing for non-existent emails
            });
        }

        const user = result.rows[0];

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

        // Store hashed token in database (for security)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [hashedToken, resetTokenExpires, user.id]
        );

        // In production, you would send this token via email
        // For demo/development, we return it in the response
        return res.status(200).json({
            message: 'Password reset token generated successfully',
            // NOTE: In production, send this via email instead of returning it!
            resetToken,
            expiresAt: resetTokenExpires,
            // Include user info for the reset page
            email: user.email
        });
    } catch (err) {
        console.error('Error requesting password reset:', err);
        return res.status(500).json({ error: 'Failed to process password reset request' });
    }
};

// Reset password using token
module.exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Validate inputs
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Reset token is required' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

        // Find user with valid (non-expired) reset token
        const result = await pool.query(
            'SELECT id, email, username FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [hashedToken]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = result.rows[0];

        // Hash new password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [passwordHash, user.id]
        );

        // Generate new JWT for auto-login after password reset
        const jwtToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Password reset successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token: jwtToken
        });
    } catch (err) {
        console.error('Error resetting password:', err);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
};

// Validate reset token (check if it's still valid without using it)
module.exports.validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ valid: false, error: 'Token is required' });
        }

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

        // Check if token exists and is not expired
        const result = await pool.query(
            'SELECT email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [hashedToken]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ valid: false, error: 'Invalid or expired reset token' });
        }

        return res.status(200).json({ 
            valid: true, 
            email: result.rows[0].email 
        });
    } catch (err) {
        console.error('Error validating reset token:', err);
        return res.status(500).json({ valid: false, error: 'Failed to validate token' });
    }
};

// Export JWT_SECRET for middleware
module.exports.JWT_SECRET = JWT_SECRET;
