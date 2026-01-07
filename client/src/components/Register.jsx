import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    
    const { register } = useAuth();
    const navigate = useNavigate();

    // Calculate password strength
    const passwordStrength = useMemo(() => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 3);
    }, [password]);

    const validateForm = () => {
        const errors = {};
        
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email';
        }
        
        if (!username) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        const result = await register(email, username, password);
        
        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.error);
        }
        
        setLoading(false);
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
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Start tracking your Pokemon EVs</p>
                    </div>
                    
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="trainer@pokemon.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                            {fieldErrors.email && (
                                <span className="auth-field-error">{fieldErrors.email}</span>
                            )}
                        </div>
                        
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                className={`auth-input ${fieldErrors.username ? 'error' : ''}`}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                disabled={loading}
                                autoComplete="username"
                            />
                            {fieldErrors.username && (
                                <span className="auth-field-error">{fieldErrors.username}</span>
                            )}
                        </div>
                        
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            {password && (
                                <div className="password-strength">
                                    {[1, 2, 3].map((level) => (
                                        <div 
                                            key={level}
                                            className={`password-strength-bar ${
                                                passwordStrength >= level 
                                                    ? passwordStrength === 1 ? 'weak' 
                                                      : passwordStrength === 2 ? 'medium' 
                                                      : 'strong'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                            {fieldErrors.password && (
                                <span className="auth-field-error">{fieldErrors.password}</span>
                            )}
                        </div>
                        
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`auth-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            {fieldErrors.confirmPassword && (
                                <span className="auth-field-error">{fieldErrors.confirmPassword}</span>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="auth-loading">
                                    <span className="auth-spinner"></span>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            Already have an account?{' '}
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

export default Register;
