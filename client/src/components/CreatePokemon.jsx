import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import axios from 'axios';
import {useNavigate, Link} from 'react-router-dom';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import './PokemonForm.css';

const CreatePokemon = (props) => {
    const [pokemon, setPokemon] = useState({
        pokemonName: '',
        pokemonSpeciesNumber: 1,
        description: '',
        level: 100,
        nature: '',
        ability: '',
        heldItem: '',
        hpIV: 31,
        attackIV: 31,
        defenseIV: 31,
        specialAttackIV: 31,
        specialDefenseIV: 31,
        speedIV: 31,
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

    // Species search state
    const [speciesSearchQuery, setSpeciesSearchQuery] = useState('bulbasaur');
    const [speciesDropdownOpen, setSpeciesDropdownOpen] = useState(false);
    const [userHasSearched, setUserHasSearched] = useState(false);
    const [selectedSpeciesName, setSelectedSpeciesName] = useState(null);
    const [variantPokemonId, setVariantPokemonId] = useState(null);
    const speciesInputRef = useRef(null);
    const speciesDropdownRef = useRef(null);

    useEffect(() => {
        setSpeciesLoading(true);
        axios.get(`${API_BASE_URL}/api/pokemon-species`)
            .then((response) => {
                const species = response.data || [];
                setAllPokemonSpecies(species);
                // Only set initial search query if user hasn't started searching
                if (!userHasSearched && species.length > 0) {
                    setSpeciesSearchQuery(species[0].name);
                }
            })
            .catch((err) => {
                console.log(err);
                setAllPokemonSpecies([]);
            })
            .finally(() => {
                setSpeciesLoading(false);
            });
    }, [userHasSearched])

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
        const filtered = allPokemonSpecies.filter(species => 
            species.name.toLowerCase().includes(query) ||
            species.speciesNumber.toString().includes(query)
        );
        
        // If search looks like a variant (alolan, galarian, etc.) and no results, 
        // create a synthetic entry for it
        if (filtered.length === 0 && (
            query.includes('alolan') || 
            query.includes('galarian') || 
            query.includes('hisuian') ||
            query.includes('paldean')
        )) {
            // Try to extract base Pokemon name and create a variant entry
            const variantMatch = query.match(/(alolan|galarian|hisuian|paldean)\s+(.+)/);
            if (variantMatch) {
                const [, variantType, baseName] = variantMatch;
                const baseSpecies = allPokemonSpecies.find(s => 
                    s.name.toLowerCase() === baseName.toLowerCase()
                );
                if (baseSpecies) {
                    return [{
                        name: `${variantType} ${baseSpecies.name}`,
                        speciesNumber: baseSpecies.speciesNumber,
                        isVariant: true
                    }];
                }
            }
            // If we can't find base, create entry with the search query as name
            return [{
                name: query,
                speciesNumber: 0, // Will be resolved by name lookup
                isVariant: true
            }];
        }
        
        return filtered;
    }, [allPokemonSpecies, speciesSearchQuery]);

    // Get selected species name
    const selectedSpecies = useMemo(() => {
        return allPokemonSpecies.find(s => s.speciesNumber === pokemon.pokemonSpeciesNumber);
    }, [allPokemonSpecies, pokemon.pokemonSpeciesNumber]);

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

    const handleSpeciesSelect = useCallback(async (species) => {
        setSpeciesSearchQuery(species.name);
        setSelectedSpeciesName(species.name);
        setSpeciesDropdownOpen(false);
        setUserHasSearched(true);
        setVariantPokemonId(null);
        
        // If it's a variant, fetch the actual Pokemon ID
        const nameLower = species.name.toLowerCase();
        const isVariant = species.isVariant || 
                         species.speciesNumber === 0 ||
                         nameLower.includes('alolan') || 
                         nameLower.includes('galarian') ||
                         nameLower.includes('hisuian') ||
                         nameLower.includes('paldean');
        
        if (isVariant) {
            try {
                const identifier = species.name.toLowerCase().replace(/\s+/g, '-');
                const response = await axios.get(`${API_BASE_URL}/api/pokemon-species/${identifier}`);
                const pokemonId = response.data.pokemonId || response.data.speciesNumber;
                setVariantPokemonId(pokemonId);
                setPokemon(prev => ({...prev, pokemonSpeciesNumber: pokemonId}));
            } catch (err) {
                console.error('Failed to fetch variant Pokemon ID:', err);
                // Fallback to base species number
                setPokemon(prev => ({...prev, pokemonSpeciesNumber: species.speciesNumber || 1}));
            }
        } else {
            setPokemon(prev => ({...prev, pokemonSpeciesNumber: species.speciesNumber}));
        }
    }, []);

    const handleSpeciesInputChange = useCallback((e) => {
        setSpeciesSearchQuery(e.target.value);
        setSpeciesDropdownOpen(true);
        setUserHasSearched(true);
    }, []);

    const handleSpeciesInputFocus = useCallback(() => {
        setSpeciesDropdownOpen(true);
    }, []);

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/api/newPokemon`, pokemon)
        .then((response) => {
            console.log(response);
            navigate("/");
        })
        .catch((err) => {
            console.log(err);
            setErrors(err?.response?.data?.errors ?? {});
        })
    }

    const spriteUrl = spriteUrlForSpecies(variantPokemonId || pokemon.pokemonSpeciesNumber, props?.maxPokemonId);

    return (
        <div className="pokemon-page">
            {/* Page Header */}
            <div className="pokemon-page-header">
                <Link to="/" className="pokemon-back-link">
                    ← Back to Box
                </Link>
                <h1 className="pokemon-page-title">Create Pokemon</h1>
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
                                <h2>New Pokemon</h2>
                                <p>Add a new Pokemon to track their EVs and stats</p>
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
                                    {errors?.pokemonName && (
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
                                                        {filteredSpecies.slice(0, 50).map((species) => {
                                                            const isSelected = selectedSpeciesName === species.name || 
                                                                              (!selectedSpeciesName && species.speciesNumber === pokemon.pokemonSpeciesNumber);
                                                            const spriteUrl = species.isVariant && species.speciesNumber === 0
                                                                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png` // Placeholder
                                                                : spriteUrlForSpecies(species.speciesNumber, props?.maxPokemonId);
                                                            
                                                            return (
                                                                <div
                                                                    key={`${species.speciesNumber}-${species.name}`}
                                                                    className={`pokemon-species-option ${isSelected ? 'selected' : ''}`}
                                                                    onClick={() => handleSpeciesSelect(species)}
                                                                >
                                                                    <img 
                                                                        src={spriteUrl}
                                                                        alt={species.name}
                                                                        className="pokemon-species-option-sprite"
                                                                        onError={(e) => {
                                                                            if (species.isVariant) {
                                                                                e.target.style.display = 'none';
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span className="pokemon-species-option-number">#{species.speciesNumber || '?'}</span>
                                                                    <span className="pokemon-species-option-name">{species.name}</span>
                                                                </div>
                                                            );
                                                        })}
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
                                    {errors?.pokemonSpeciesNumber && (
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
                                        value={pokemon.description}
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
                                    {errors?.level && (
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
                                        value={pokemon.nature}
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
                                        value={pokemon.ability}
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
                                        value={pokemon.heldItem}
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
                                    {errors?.hpEVs && <span className="pokemon-form-error">{errors.hpEVs.message}</span>}
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
                                    {errors?.attackEVs && <span className="pokemon-form-error">{errors.attackEVs.message}</span>}
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
                                    {errors?.defenseEVs && <span className="pokemon-form-error">{errors.defenseEVs.message}</span>}
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
                                    {errors?.specialAttackEVs && <span className="pokemon-form-error">{errors.specialAttackEVs.message}</span>}
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
                                    {errors?.specialDefenseEVs && <span className="pokemon-form-error">{errors.specialDefenseEVs.message}</span>}
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
                                    {errors?.speedEVs && <span className="pokemon-form-error">{errors.speedEVs.message}</span>}
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
                                        value={pokemon.move1}
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
                                        value={pokemon.move2}
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
                                        value={pokemon.move3}
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
                                        value={pokemon.move4}
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
                                Add Pokemon
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePokemon;
