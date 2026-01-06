import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import './PokemonForm.css';

const UpdatePokemon = (props) => {
    const [pokemon, setPokemon] = useState({
        pokemonName: '',
        pokemonSpeciesNumber: 1,
        description: '',
        level: 100,
        nature: '',
        ability: '',
        heldItem: '',
        hpIV: '',
        attackIV: '',
        defenseIV: '',
        specialAttackIV: '',
        specialDefenseIV: '',
        speedIV: '',
        move1: '',
        move2: '',
        move3: '',
        move4: '',
        hpEVs: 0,
        attackEVs: 0,
        defenseEVs: 0,
        specialAttackEVs: 0,
        specialDefenseEVs: 0,
        speedEVs: 0
    });
    const [allPokemonSpecies, setAllPokemonSpecies] = useState([]);
    const [speciesLoading, setSpeciesLoading] = useState(true);
    const [natures, setNatures] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const {id} = useParams();

    // Species search state
    const [speciesSearchQuery, setSpeciesSearchQuery] = useState('');
    const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);
    const [speciesInitialized, setSpeciesInitialized] = useState(false);
    const speciesInputRef = useRef(null);
    const speciesDropdownRef = useRef(null);

    useEffect(() => {
        setSpeciesLoading(true);
        axios.get(`${API_BASE_URL}/api/pokemon-species`)
            .then((response) => {
                setAllPokemonSpecies(response.data || []);
            })
            .catch((err) => {
                console.log(err);
                setAllPokemonSpecies([]);
            })
            .finally(() => {
                setSpeciesLoading(false);
            });
    }, [])

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/natures`)
            .then((response) => {
                setNatures(response.data || []);
            })
            .catch((err) => {
                console.log(err);
                setNatures([]);
            });
    }, []);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/onePokemon/${id}`)
        .then((response) => {
            setPokemon(response.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [id])

    // Set the search query when both pokemon and species list are loaded
    useEffect(() => {
        if (!speciesInitialized && pokemon.pokemonSpeciesNumber && allPokemonSpecies.length > 0) {
            const species = allPokemonSpecies.find(s => s.speciesNumber === pokemon.pokemonSpeciesNumber);
            if (species) {
                setSpeciesSearchQuery(species.name);
                setSpeciesInitialized(true);
            }
        }
    }, [pokemon.pokemonSpeciesNumber, allPokemonSpecies, speciesInitialized])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (speciesDropdownRef.current && !speciesDropdownRef.current.contains(e.target) &&
                speciesInputRef.current && !speciesInputRef.current.contains(e.target)) {
                setSpeciesDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered species based on search
    const filteredSpecies = useMemo(() => {
        if (!speciesSearchQuery.trim()) {
            return allPokemonSpecies;
        }
        const query = speciesSearchQuery.toLowerCase();
        return allPokemonSpecies.filter(species => 
            species.name.toLowerCase().includes(query) ||
            species.speciesNumber.toString().includes(query)
        );
    }, [allPokemonSpecies, speciesSearchQuery]);

    const onChangeHandler = (e) => {
        let value = e.target.value;

        const intFields = new Set([
            'pokemonSpeciesNumber',
            'level',
            'hpEVs',
            'attackEVs',
            'defenseEVs',
            'specialAttackEVs',
            'specialDefenseEVs',
            'speedEVs',
            'hpIV',
            'attackIV',
            'defenseIV',
            'specialAttackIV',
            'specialDefenseIV',
            'speedIV'
        ]);

        if (intFields.has(e.target.name)) {
            value = value === '' ? null : parseInt(value);
        }

        setPokemon({...pokemon, [e.target.name]: value})
    }

    const handleSpeciesSelect = useCallback((species) => {
        setPokemon(prev => ({...prev, pokemonSpeciesNumber: species.speciesNumber}));
        setSpeciesSearchQuery(species.name);
        setSpeciesDropdownOpen(false);
        setSpeciesInitialized(true);
    }, []);

    const handleSpeciesInputChange = useCallback((e) => {
        setSpeciesSearchQuery(e.target.value);
        setSpeciesDropdownOpen(true);
        setSpeciesInitialized(true);
    }, []);

    const handleSpeciesInputFocus = useCallback(() => {
        setSpeciesDropdownOpen(true);
    }, []);

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.put(`${API_BASE_URL}/api/updatePokemon/${id}`, pokemon)
        .then((response) => {
            console.log(response);
            navigate("/");
        })
        .catch((err) => {
            console.log(err);
            setErrors(err.response?.data?.errors || {});
        })
    }

    const spriteUrl = spriteUrlForSpecies(pokemon?.pokemonSpeciesNumber, props?.maxPokemonId);

    return (
        <div className="pokemon-page">
            {/* Page Header */}
            <div className="pokemon-page-header">
                <Link to="/" className="pokemon-back-link">
                    ← Back to Box
                </Link>
                <h1 className="pokemon-page-title">Edit Pokemon</h1>
            </div>

            {/* Form Panel */}
            <div className="pokemon-content-panel">
                <div className="pokemon-form-container">
                    <form onSubmit={onSubmitHandler}>
                        {/* Header with Sprite */}
                        <div className="pokemon-form-header">
                            <div className="pokemon-form-sprite-circle">
                                <img src={spriteUrl} alt={pokemon.pokemonName || 'Pokemon'} />
                            </div>
                            <div className="pokemon-form-header-info">
                                <h2>{pokemon.pokemonName || 'Edit Pokemon'}</h2>
                                <p>Update your Pokemon's stats, moves, and information</p>
                            </div>
                        </div>

                        {/* Basic Info Section */}
                        <div className="pokemon-form-section">
                            <h3 className="pokemon-form-section-title">Basic Info</h3>
                            <div className="pokemon-form-grid cols-2">
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Pokemon Name</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.pokemonName}
                                        name="pokemonName"
                                        placeholder="Enter nickname"
                                    />
                                    {errors.pokemonName && (
                                        <span className="pokemon-form-error">{errors.pokemonName.message}</span>
                                    )}
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Species</label>
                                    <div className="pokemon-species-search">
                                        <input
                                            ref={speciesInputRef}
                                            type="text"
                                            className="pokemon-form-input pokemon-species-input"
                                            value={speciesSearchQuery}
                                            onChange={handleSpeciesInputChange}
                                            onFocus={handleSpeciesInputFocus}
                                            placeholder="Search species..."
                                            autoComplete="off"
                                        />
                                        {speciesDropdownOpen && (
                                            <div ref={speciesDropdownRef} className="pokemon-species-dropdown">
                                                {speciesLoading ? (
                                                    <div className="pokemon-species-option pokemon-species-loading">
                                                        <div className="pokemon-species-spinner"></div>
                                                        Loading species...
                                                    </div>
                                                ) : filteredSpecies.length === 0 ? (
                                                    <div className="pokemon-species-option pokemon-species-no-results">
                                                        No species found
                                                    </div>
                                                ) : (
                                                    <>
                                                        {filteredSpecies.slice(0, 50).map((species) => (
                                                            <div
                                                                key={species.speciesNumber}
                                                                className={`pokemon-species-option ${species.speciesNumber === pokemon.pokemonSpeciesNumber ? 'selected' : ''}`}
                                                                onClick={() => handleSpeciesSelect(species)}
                                                            >
                                                                <img 
                                                                    src={spriteUrlForSpecies(species.speciesNumber, props?.maxPokemonId)} 
                                                                    alt={species.name}
                                                                    className="pokemon-species-option-sprite"
                                                                />
                                                                <span className="pokemon-species-option-number">#{species.speciesNumber}</span>
                                                                <span className="pokemon-species-option-name">{species.name}</span>
                                                            </div>
                                                        ))}
                                                        {filteredSpecies.length > 50 && (
                                                            <div className="pokemon-species-option pokemon-species-more">
                                                                ...and {filteredSpecies.length - 50} more. Keep typing to narrow down.
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.pokemonSpeciesNumber && (
                                        <span className="pokemon-form-error">{errors.pokemonSpeciesNumber.message}</span>
                                    )}
                                </div>
                                <div className="pokemon-form-group full-width">
                                    <label className="pokemon-form-label">
                                        Description <span className="pokemon-form-label-optional">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.description || ''}
                                        name="description"
                                        placeholder="Add notes about this Pokemon"
                                    />
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Level</label>
                                    <input
                                        type="number"
                                        className="pokemon-form-input"
                                        min="1"
                                        max="100"
                                        onChange={onChangeHandler}
                                        value={pokemon.level}
                                        name="level"
                                    />
                                    {errors.level && (
                                        <span className="pokemon-form-error">{errors.level.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nature, Ability, Item Section */}
                        <div className="pokemon-form-section">
                            <h3 className="pokemon-form-section-title">Traits</h3>
                            <div className="pokemon-form-grid cols-3">
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Nature</label>
                                    <select
                                        className="pokemon-form-select"
                                        onChange={onChangeHandler}
                                        value={pokemon.nature || ''}
                                        name="nature"
                                    >
                                        <option value="">(not set)</option>
                                        {natures.map((n) => {
                                            const labelBase = n.name ? (n.name.charAt(0).toUpperCase() + n.name.slice(1)) : '';
                                            const inc = n.increasedStat || '—';
                                            const dec = n.decreasedStat || '—';
                                            const label = `${labelBase} (${inc === '—' ? 'neutral' : `+${inc}`}${dec === '—' ? '' : `, -${dec}`})`;
                                            return (
                                                <option key={n.name} value={labelBase}>{label}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Ability</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.ability || ''}
                                        name="ability"
                                        placeholder="e.g. Intimidate"
                                    />
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Held Item</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.heldItem || ''}
                                        name="heldItem"
                                        placeholder="e.g. Leftovers"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EVs Section */}
                        <div className="pokemon-form-section">
                            <h3 className="pokemon-form-section-title">Effort Values (EVs)</h3>
                            <div className="pokemon-form-grid cols-6">
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">HP</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.hpEVs}
                                        name="hpEVs"
                                    />
                                    {errors.hpEVs && <span className="pokemon-form-error">{errors.hpEVs.message}</span>}
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Attack</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.attackEVs}
                                        name="attackEVs"
                                    />
                                    {errors.attackEVs && <span className="pokemon-form-error">{errors.attackEVs.message}</span>}
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Defense</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.defenseEVs}
                                        name="defenseEVs"
                                    />
                                    {errors.defenseEVs && <span className="pokemon-form-error">{errors.defenseEVs.message}</span>}
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Sp. Atk</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.specialAttackEVs}
                                        name="specialAttackEVs"
                                    />
                                    {errors.specialAttackEVs && <span className="pokemon-form-error">{errors.specialAttackEVs.message}</span>}
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Sp. Def</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.specialDefenseEVs}
                                        name="specialDefenseEVs"
                                    />
                                    {errors.specialDefenseEVs && <span className="pokemon-form-error">{errors.specialDefenseEVs.message}</span>}
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Speed</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="252"
                                        onChange={onChangeHandler}
                                        value={pokemon.speedEVs}
                                        name="speedEVs"
                                    />
                                    {errors.speedEVs && <span className="pokemon-form-error">{errors.speedEVs.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* IVs Section */}
                        <div className="pokemon-form-section">
                            <h3 className="pokemon-form-section-title">Individual Values (IVs)</h3>
                            <div className="pokemon-form-grid cols-6">
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">HP</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.hpIV ?? ''}
                                        name="hpIV"
                                        placeholder="31"
                                    />
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Attack</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.attackIV ?? ''}
                                        name="attackIV"
                                        placeholder="31"
                                    />
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Defense</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.defenseIV ?? ''}
                                        name="defenseIV"
                                        placeholder="31"
                                    />
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Sp. Atk</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.specialAttackIV ?? ''}
                                        name="specialAttackIV"
                                        placeholder="31"
                                    />
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Sp. Def</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.specialDefenseIV ?? ''}
                                        name="specialDefenseIV"
                                        placeholder="31"
                                    />
                                </div>
                                <div className="pokemon-stat-input-group">
                                    <label className="pokemon-stat-label">Speed</label>
                                    <input
                                        type="number"
                                        className="pokemon-stat-input"
                                        min="0"
                                        max="31"
                                        onChange={onChangeHandler}
                                        value={pokemon.speedIV ?? ''}
                                        name="speedIV"
                                        placeholder="31"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Moves Section */}
                        <div className="pokemon-form-section">
                            <h3 className="pokemon-form-section-title">Moves</h3>
                            <div className="pokemon-form-grid cols-2">
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Move 1</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.move1 || ''}
                                        name="move1"
                                        placeholder="e.g. Earthquake"
                                    />
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Move 2</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.move2 || ''}
                                        name="move2"
                                        placeholder="e.g. Dragon Claw"
                                    />
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Move 3</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.move3 || ''}
                                        name="move3"
                                        placeholder="e.g. Swords Dance"
                                    />
                                </div>
                                <div className="pokemon-form-group">
                                    <label className="pokemon-form-label">Move 4</label>
                                    <input
                                        type="text"
                                        className="pokemon-form-input"
                                        onChange={onChangeHandler}
                                        value={pokemon.move4 || ''}
                                        name="move4"
                                        placeholder="e.g. Protect"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="pokemon-form-actions">
                            <Link to="/" className="pokemon-btn-secondary">
                                Cancel
                            </Link>
                            <button type="submit" className="pokemon-btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdatePokemon;
