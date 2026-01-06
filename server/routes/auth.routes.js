const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (app) => {
    // Public routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    
    // Protected routes
    app.get('/api/auth/me', authenticateToken, authController.me);
};
