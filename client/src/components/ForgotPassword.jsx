import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Auth.css';

/**
 * Sanitize email input on the client side
 */
const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase().slice(0, 255);
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setResetToken('');

        // Sanitize and validate email
        const sanitizedEmail = sanitizeEmail(email);
        
        if (!sanitizedEmail) {
            setError('Please enter a valid email address');
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: sanitizedEmail
            });

            setSuccess(true);
            
            // In development/demo mode, the token is returned directly
            // In production, this would be sent via email
            if (response.data.resetToken) {
                setResetToken(response.data.resetToken);
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.error || 'Failed to process request';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-panel">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <img 
                                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                                alt="Pokeball"
                                style={{ width: '48px', height: '48px' }}
                            />
                        </div>
                        <h1 className="auth-title">Forgot Password</h1>
                        <p className="auth-subtitle">Enter your email to reset your password</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="auth-success">
                            <div className="auth-success-icon">✓</div>
                            <h3>Reset Token Generated!</h3>
                            <p>In a production environment, this would be sent to your email.</p>
                            
                            {resetToken && (
                                <div className="auth-token-display">
                                    <p className="auth-token-label">Your reset token:</p>
                                    <code className="auth-token-code">{resetToken}</code>
                                    <Link 
                                        to={`/reset-password?token=${resetToken}`} 
                                        className="auth-submit"
                                        style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '16px' }}
                                    >
                                        Reset Password Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                    autoComplete="email"
                                    maxLength={255}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="auth-loading">
                                        <span className="auth-spinner"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            Remember your password?{' '}
                            <Link to="/login" className="auth-footer-link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
