import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Display from './components/Display';
import Nav from './components/Nav';
import CreatePokemon from './components/CreatePokemon';
import UpdatePokemon from './components/UpdatePokemon';
import PokemonDetail from './components/PokemonDetail';

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
        <Nav/>
        <Routes>
          <Route element={<Display maxPokemonId={maxPokemonId} />} path="/myPokemon" default />
          <Route element={<CreatePokemon maxPokemonId={maxPokemonId} />} path="/Pokemon/new" />
          <Route element={<PokemonDetail maxPokemonId={maxPokemonId} />} path="/Pokemon/:id" />
          <Route element={<UpdatePokemon maxPokemonId={maxPokemonId} />} path="/Pokemon/:id/edit" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
