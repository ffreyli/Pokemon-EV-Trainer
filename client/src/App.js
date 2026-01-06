import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Display from './components/Display';
import Nav from './components/Nav';
import CreatePokemon from './components/CreatePokemon';
import UpdatePokemon from './components/UpdatePokemon';
import PokemonDetail from './components/PokemonDetail';
import Login from './components/Login';
import Register from './components/Register';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public route - redirect to home if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes({ maxPokemonId }) {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route 
        element={
          <ProtectedRoute>
            <Display maxPokemonId={maxPokemonId} />
          </ProtectedRoute>
        } 
        path="/" 
      />
      <Route 
        element={
          <ProtectedRoute>
            <CreatePokemon maxPokemonId={maxPokemonId} />
          </ProtectedRoute>
        } 
        path="/Pokemon/new" 
      />
      <Route 
        element={
          <ProtectedRoute>
            <PokemonDetail maxPokemonId={maxPokemonId} />
          </ProtectedRoute>
        } 
        path="/Pokemon/:id" 
      />
      <Route 
        element={
          <ProtectedRoute>
            <UpdatePokemon maxPokemonId={maxPokemonId} />
          </ProtectedRoute>
        } 
        path="/Pokemon/:id/edit" 
      />
      
      {/* Public Routes */}
      <Route 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
        path="/login" 
      />
      <Route 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
        path="/register" 
      />
    </Routes>
  );
}

function App() {
  const initialMax = (() => {
    try {
      const raw = localStorage.getItem('pokeapiPokemonCount');
      const n = parseInt(raw);
      return Number.isNaN(n) || n < 1 ? null : n;
    } catch {
      return null;
    }
  })();

  const [maxPokemonId, setMaxPokemonId] = useState(initialMax);

  // App startup: fetch authoritative pokemon count from PokeAPI and persist it as upper bound.
  useEffect(() => {
    let cancelled = false;
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1')
      .then((r) => r.json())
      .then((data) => {
        const n = parseInt(data?.count);
        if (cancelled) return;
        if (!Number.isNaN(n) && n > 0) {
          setMaxPokemonId(n);
          try {
            localStorage.setItem('pokeapiPokemonCount', String(n));
          } catch {
            // ignore storage failures
          }
        }
      })
      .catch((err) => {
        // Best-effort: fall back to cached value if present
        console.log(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Nav/>
          <AppRoutes maxPokemonId={maxPokemonId} />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
