import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import './Auth.css';

/**
 * Sanitize token input
 */
const sanitizeToken = (token) => {
    if (typeof token !== 'string') return '';
    // Only allow hex characters (what crypto.randomBytes produces)
    return token.trim().replace(/[^a-f0-9]/gi, '').slice(0, 64);
};

/**
 * Calculate password strength
 */
const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, text: 'Weak' };
    if (score <= 3) return { level: 2, text: 'Medium' };
    return { level: 3, text: 'Strong' };
};

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthData } = useAuth();
    
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Get token from URL and validate it
    useEffect(() => {
        const urlToken = searchParams.get('token');
        
        if (!urlToken) {
            setTokenError('No reset token provided. Please request a new password reset.');
            setValidating(false);
            return;
        }

        const sanitizedToken = sanitizeToken(urlToken);
        
        if (!sanitizedToken || sanitizedToken.length < 32) {
            setTokenError('Invalid reset token format.');
            setValidating(false);
            return;
        }

        setToken(sanitizedToken);

        // Validate token with backend
        axios.get(`${API_BASE_URL}/api/auth/validate-reset-token/${sanitizedToken}`)
            .then((response) => {
                if (response.data.valid) {
                    setUserEmail(response.data.email);
                } else {
                    setTokenError('Invalid or expired reset token.');
                }
            })
            .catch((err) => {
                const errorMsg = err?.response?.data?.error || 'Invalid or expired reset token.';
                setTokenError(errorMsg);
            })
            .finally(() => {
                setValidating(false);
            });
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password
        if (!password) {
            setError('Password is required');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password.length > 128) {
            setError('Password is too long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token,
                password
            });

            // Auto-login after successful password reset
            if (response.data.token && response.data.user) {
                setAuthData(response.data.user, response.data.token);
                navigate('/', { replace: true });
            } else {
                // Fallback: redirect to login
                navigate('/login', { 
                    replace: true, 
                    state: { message: 'Password reset successfully. Please sign in.' } 
                });
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.error || 'Failed to reset password';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    // Show loading while validating token
    if (validating) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-panel">
                        <div className="auth-header">
                            <div className="auth-logo">
                                <span className="auth-spinner" style={{ width: '32px', height: '32px' }}></span>
                            </div>
                            <h1 className="auth-title">Validating...</h1>
                            <p className="auth-subtitle">Please wait while we verify your reset token</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (tokenError) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-panel">
                        <div className="auth-header">
                            <div className="auth-logo">
                                <span style={{ fontSize: '2rem' }}>⚠️</span>
                            </div>
                            <h1 className="auth-title">Invalid Token</h1>
                            <p className="auth-subtitle">{tokenError}</p>
                        </div>

                        <div className="auth-footer" style={{ borderTop: 'none', marginTop: '8px' }}>
                            <Link to="/forgot-password" className="auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                Request New Reset Link
                            </Link>
                            <p className="auth-footer-text" style={{ marginTop: '16px' }}>
                                Or{' '}
                                <Link to="/login" className="auth-footer-link">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h1 className="auth-title">Reset Password</h1>
                        <p className="auth-subtitle">
                            {userEmail ? `Enter a new password for ${userEmail}` : 'Enter your new password'}
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="password">New Password</label>
                            <input
                                id="password"
                                type="password"
                                className="auth-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                disabled={loading}
                                autoComplete="new-password"
                                maxLength={128}
                            />
                            {password && (
                                <div className="password-strength">
                                    <div className={`password-strength-bar ${passwordStrength.level >= 1 ? 'weak' : ''}`}></div>
                                    <div className={`password-strength-bar ${passwordStrength.level >= 2 ? 'medium' : ''}`}></div>
                                    <div className={`password-strength-bar ${passwordStrength.level >= 3 ? 'strong' : ''}`}></div>
                                </div>
                            )}
                        </div>

                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`auth-input ${confirmPassword && password !== confirmPassword ? 'error' : ''}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                disabled={loading}
                                autoComplete="new-password"
                                maxLength={128}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <span className="auth-field-error">Passwords do not match</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit"
                            disabled={loading || !password || password !== confirmPassword}
                        >
                            {loading ? (
                                <span className="auth-loading">
                                    <span className="auth-spinner"></span>
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

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

export default ResetPassword;
