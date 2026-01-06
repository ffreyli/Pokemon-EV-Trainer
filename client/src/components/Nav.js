import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import './Nav.css';

const Nav = (props) => {
    const location = useLocation();
    
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="pokemon-nav">
            <div className="nav-content">
                <h1 className="nav-title">
                    <span className="nav-title-icon">🎮</span>
                    Pokemon EV Trainer
                </h1>
                <div className="nav-buttons">
                    <Link 
                        to="/" 
                        className={`nav-btn ${isActive('/') ? 'active' : ''}`}
                    >
                        <span className="nav-btn-icon">📦</span>
                        My Pokemon
                    </Link>
                    <Link 
                        to="/Pokemon/new" 
                        className={`nav-btn ${isActive('/Pokemon/new') ? 'active' : ''}`}
                    >
                        <span className="nav-btn-icon">✨</span>
                        Create Pokemon
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Nav;
