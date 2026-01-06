import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
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
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        
        const result = await login(email, password);
        
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
                            <label className="auth-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="trainer@pokemon.com"
                                disabled={loading}
                                autoComplete="email"
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
