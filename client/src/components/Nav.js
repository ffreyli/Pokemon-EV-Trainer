import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import './Nav.css';

const Nav = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="pokemon-nav">
            <div className="nav-content">
                <Link to="/" className="nav-title-link">
                    <h1 className="nav-title">
                        Pokemon EV Trainer
                    </h1>
                </Link>
                <div className="nav-buttons">
                    {isAuthenticated ? (
                        <>
                            <Link 
                                to="/" 
                                className={`nav-btn ${isActive('/') ? 'active' : ''}`}
                            >
                                <img 
                                    src={spriteUrlForSpecies(133)} 
                                    alt="Eevee" 
                                    className="nav-btn-eevee-sprite"
                                />
                                My Pokemon
                            </Link>
                            <div className="nav-user">
                                <span className="nav-username">{user?.username}</span>
                                <button 
                                    className="nav-btn nav-btn-logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className={`nav-btn ${isActive('/login') ? 'active' : ''}`}
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register" 
                                className={`nav-btn nav-btn-primary ${isActive('/register') ? 'active' : ''}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Nav;
