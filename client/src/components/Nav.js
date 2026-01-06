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
                <Link to="/" className="nav-title-link">
                    <h1 className="nav-title">
                        Pokemon EV Trainer
                    </h1>
                </Link>
                <div className="nav-buttons">
                    <Link 
                        to="/" 
                        className={`nav-btn ${isActive('/') ? 'active' : ''}`}
                    >
                        My Pokemon
                    </Link>
                    <Link 
                        to="/Pokemon/new" 
                        className={`nav-btn ${isActive('/Pokemon/new') ? 'active' : ''}`}
                    >
                        Create Pokemon
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Nav;
