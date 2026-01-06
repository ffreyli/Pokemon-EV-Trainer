import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import PokemonDetailPanel from './PokemonDetailPanel';
import CreatePokemonPanel from './CreatePokemonPanel';
import Pokedex from './Pokedex';
import './Display.css';

const Display = (props) => {
    const [allPokemon, setAllPokemon] = useState([]);
    const [selectedPokemonId, setSelectedPokemonId] = useState(null);
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdatedPokemon, setLastUpdatedPokemon] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_BASE_URL}/api/allPokemon`)
        .then((response) => {
            console.log(response);
            setAllPokemon(response.data);
            if (response.data.length > 0) {
                setSelectedPokemonId(response.data[0].id);
            }
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            setLoading(false);
        })
    }, [])

    const handlePokemonClick = (e, pokemon) => {
        e.preventDefault();
        setSelectedPokemonId(pokemon.id);
        setShowCreatePanel(false);
        setLastUpdatedPokemon(null); // Clear last updated Pokemon when selection changes
    };

    const handleShowCreatePanel = (e) => {
        e.preventDefault();
        setShowCreatePanel(true);
        setSelectedPokemonId(null); // Clear selection so Pokedex doesn't try to add EVs
    };

    const handleCreateCancel = () => {
        setShowCreatePanel(false);
    };

    const handlePokemonCreated = (newPokemon) => {
        // Add the new Pokemon to the list
        setAllPokemon(prev => [...prev, newPokemon]);
        // Select the newly created Pokemon
        setSelectedPokemonId(newPokemon.id);
        setShowCreatePanel(false);
    };

    const handlePokemonDeleted = (deletedId) => {
        const updatedList = allPokemon.filter(p => p.id !== deletedId);
        setAllPokemon(updatedList);
        if (selectedPokemonId === deletedId) {
            setSelectedPokemonId(updatedList.length > 0 ? updatedList[0].id : null);
        }
    };

    const handlePokemonUpdated = (updatedPokemon) => {
        // Update the Pokemon in the list
        setAllPokemon(prev => prev.map(p => 
            p.id === updatedPokemon.id ? { ...p, ...updatedPokemon } : p
        ));
    };

    const handleEvsAdded = (updatedPokemon) => {
        // Update the Pokemon in the list when EVs are added via Pokedex
        handlePokemonUpdated(updatedPokemon);
        // Store the updated Pokemon to pass to PokemonDetailPanel
        setLastUpdatedPokemon(updatedPokemon);
    };

    // Generate empty slots to fill the grid (like in the Pokemon games)
    const totalSlots = Math.max(30, Math.ceil(allPokemon.length / 5) * 5 + 5);
    const emptySlots = totalSlots - allPokemon.length - 1; // -1 for add button

    return (
        <div className="pokemon-box-container">
            {/* Header */}
            <div className="box-header">
            <h2>My Pokemon</h2>
                <span className="box-title-badge">Box 1</span>
            </div>

            {/* Main Layout - Three Column */}
            <div className="box-layout">
                {/* Pokedex Panel (Left) */}
                <div className="pokedex-column">
                    <Pokedex 
                        selectedPokemonId={selectedPokemonId}
                        maxPokemonId={props?.maxPokemonId}
                        onEvsAdded={handleEvsAdded}
                    />
                </div>

                {/* Pokemon Grid Box (Center) */}
                <div className="pokemon-box">
                    {/* Box Navigation */}
                    <div className="box-navigation">
                        <div className="box-name">
                            Storage Box
                        </div>
                        <div className="box-nav-buttons">
                            <button className="nav-btn">
                                All Boxes
                            </button>
                            <button className="nav-btn">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="stats-bar">
                        <div className="stat-item">
                            <span className="stat-label">Pokemon:</span>
                            <span className="stat-value">{allPokemon.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Capacity:</span>
                            <span className="stat-value">30</span>
                        </div>
                    </div>

                    {/* Pokemon Grid */}
                    <div className="pokemon-grid">
                        {loading ? (
                            <div className="empty-state">
                                <div className="loading-spinner"></div>
                                <div className="empty-state-text">Loading Pokemon...</div>
                            </div>
                        ) : allPokemon.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-text">No Pokemon in this box yet</div>
                            </div>
                        ) : (
                            <>
                                {allPokemon.map((pokemon, index) => {
                            const spriteUrl = pokemon?.spriteUrl || spriteUrlForSpecies(pokemon?.pokemonSpeciesNumber, props?.maxPokemonId);
                                    const isSelected = selectedPokemonId === pokemon.id;
                                    
                            return (
                                        <div 
                                            key={pokemon.id || index} 
                                            className={`pokemon-slot ${isSelected ? 'selected' : ''}`}
                                            onClick={(e) => handlePokemonClick(e, pokemon)}
                                        >
                                            {/* Info Badge */}
                                            <div className="pokemon-info-badge">
                                                {pokemon.level && (
                                                    <span className="level-badge">Lv. {pokemon.level}</span>
                                                )}
                                                {pokemon.gender && (
                                                    <span className={`gender-symbol ${pokemon.gender === 'male' ? 'gender-male' : 'gender-female'}`}>
                                                        {pokemon.gender === 'male' ? '♂' : '♀'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Sprite */}
                                            <div className="pokemon-sprite-container">
                                                <img
                                                    className="pokemon-sprite"
                                                src={spriteUrl}
                                                    alt={pokemon.pokemonName || `Pokemon #${pokemon.pokemonSpeciesNumber}`}
                                            />
                                            </div>

                                            {/* Name */}
                                            <div className="pokemon-name">
                                                {pokemon.pokemonName}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Pokemon Slot */}
                                <div 
                                    className="pokemon-slot add-pokemon-slot"
                                    onClick={handleShowCreatePanel}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="add-icon">+</span>
                                    <span className="add-text">Add New</span>
                                </div>

                                {/* Empty Slots */}
                                {Array.from({ length: emptySlots }).map((_, index) => (
                                    <div key={`empty-${index}`} className="pokemon-slot empty" />
                                ))}
                            </>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="box-actions">
                        <button 
                            className="action-btn primary"
                            onClick={handleShowCreatePanel}
                        >
                            Add Pokemon
                        </button>
                    </div>
                </div>

                {/* Detail Panel Sidebar (Right) */}
                {showCreatePanel ? (
                    <CreatePokemonPanel
                        maxPokemonId={props?.maxPokemonId}
                        onPokemonCreated={handlePokemonCreated}
                        onCancel={handleCreateCancel}
                    />
                ) : (
                    <PokemonDetailPanel 
                        pokemonId={selectedPokemonId}
                        maxPokemonId={props?.maxPokemonId}
                        onPokemonDeleted={handlePokemonDeleted}
                        onPokemonUpdated={handlePokemonUpdated}
                        updatedPokemon={lastUpdatedPokemon?.id === selectedPokemonId ? lastUpdatedPokemon : null}
                    />
                )}
            </div>
        </div>
    );
}

export default Display;
