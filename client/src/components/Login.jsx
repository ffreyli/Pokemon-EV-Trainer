import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the redirect path from location state, or default to home
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!usernameOrEmail || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        
        const result = await login(usernameOrEmail, password);
        
        if (result.success) {
            navigate(from, { replace: true });
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
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to manage your Pokemon</p>
                    </div>
                    
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="usernameOrEmail">Username or Email</label>
                            <input
                                id="usernameOrEmail"
                                name="username"
                                type="text"
                                className="auth-input"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                placeholder="Enter username or email"
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                        
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="auth-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <Link to="/forgot-password" className="auth-forgot-link">
                                Forgot password?
                            </Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="auth-loading">
                                    <span className="auth-spinner"></span>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <p className="auth-footer-text">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-footer-link">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
