import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Display from './components/Display';
import Nav from './components/Nav';
import CreatePokemon from './components/CreatePokemon';
import UpdatePokemon from './components/UpdatePokemon';
import PokemonDetail from './components/PokemonDetail';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav/>
        <Routes>
          <Route element={<Display/>} path="/myPokemon" default />
          <Route element={<CreatePokemon/>} path="/Pokemon/new" />
          <Route element={<PokemonDetail/>} path="/Pokemon/:id" />
          <Route element={<UpdatePokemon/>} path="/Pokemon/:id/edit" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
