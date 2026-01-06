import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios interceptor for auth header
    useEffect(() => {
        // Check if axios and interceptors are available (for test environments)
        if (!axios || !axios.interceptors || !axios.interceptors.request) {
            return;
        }

        const interceptor = axios.interceptors.request.use(
            (config) => {
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${storedToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            if (axios && axios.interceptors && axios.interceptors.request) {
                axios.interceptors.request.eject(interceptor);
            }
        };
    }, []);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                setUser(response.data.user);
                setToken(storedToken);
            } catch (err) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = useCallback(async (usernameOrEmail, password) => {
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: usernameOrEmail, // Backend accepts either email or username field
                username: usernameOrEmail, // Send as both for compatibility
                password
            });
            
            const { token: newToken, user: newUser } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (email, username, password) => {
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                email,
                username,
                password
            });
            
            const { token: newToken, user: newUser } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
