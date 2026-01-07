const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (app) => {
    // Public routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    
    // Password reset routes (public)
    app.post('/api/auth/forgot-password', authController.requestPasswordReset);
    app.post('/api/auth/reset-password', authController.resetPassword);
    app.get('/api/auth/validate-reset-token/:token', authController.validateResetToken);
    
    // Protected routes
    app.get('/api/auth/me', authenticateToken, authController.me);
};
