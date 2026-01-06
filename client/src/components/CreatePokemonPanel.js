import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import axios from 'axios';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import './PokemonDetailPanel.css';
import './PokemonForm.css';

const CreatePokemonPanel = ({ maxPokemonId, onPokemonCreated, onCancel }) => {
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
    const [submitting, setSubmitting] = useState(false);

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
    }, [userHasSearched]);

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

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/newPokemon`, pokemon);
            if (onPokemonCreated) {
                onPokemonCreated(response.data);
            }
            // Reset form
            setPokemon({
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
            setSpeciesSearchQuery('bulbasaur');
            setUserHasSearched(false);
            if (onCancel) {
                onCancel();
            }
        } catch (err) {
            console.log(err);
            setErrors(err?.response?.data?.errors ?? {});
        } finally {
            setSubmitting(false);
        }
    }

    const spriteUrl = spriteUrlForSpecies(variantPokemonId || pokemon.pokemonSpeciesNumber, maxPokemonId);

    // Calculate total EVs
    const totalEVs = (pokemon.hpEVs || 0) + 
                     (pokemon.attackEVs || 0) + 
                     (pokemon.defenseEVs || 0) + 
                     (pokemon.specialAttackEVs || 0) + 
                     (pokemon.specialDefenseEVs || 0) + 
                     (pokemon.speedEVs || 0);

    // EV adjustment handler
    const adjustEV = (statKey, delta) => {
        const currentValue = pokemon[statKey] || 0;
        const newValue = Math.max(0, Math.min(252, currentValue + delta));
        const newTotal = totalEVs - currentValue + newValue;
        
        if (newTotal <= 510) {
            setPokemon(prev => ({
                ...prev,
                [statKey]: newValue
            }));
        }
    };

    // EV stats for rendering
    const evStats = [
        { key: 'hpEVs', label: 'HP', value: pokemon.hpEVs || 0 },
        { key: 'attackEVs', label: 'Atk', value: pokemon.attackEVs || 0 },
        { key: 'defenseEVs', label: 'Def', value: pokemon.defenseEVs || 0 },
        { key: 'specialAttackEVs', label: 'SpA', value: pokemon.specialAttackEVs || 0 },
        { key: 'specialDefenseEVs', label: 'SpD', value: pokemon.specialDefenseEVs || 0 },
        { key: 'speedEVs', label: 'Spe', value: pokemon.speedEVs || 0 },
    ];

    return (
        <div className="detail-panel">
            {/* Header */}
            <div className="detail-header">
                <div className="detail-sprite-circle create-panel-sprite">
                    <img src={spriteUrl} alt="New Pokemon" className="detail-sprite create-panel-sprite" />
                </div>
                <div className="detail-name-section">
                    <h3 className="detail-pokemon-name">New Pokemon</h3>
                    <span className="detail-level-badge">Create</span>
                </div>
            </div>

            <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Basic Info - Compact */}
                <div className="detail-section">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                                        : spriteUrlForSpecies(species.speciesNumber, maxPokemonId);
                                                    
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
                        </div>
                    </div>
                </div>

                {/* Info Row - Nature, Ability, Item */}
                <div className="detail-info-row">
                    <div className="info-item">
                        <span className="info-label">Nature</span>
                        <select
                            className="info-value-select"
                            onChange={onChangeHandler}
                            value={pokemon.nature}
                            name="nature"
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--pkmn-text-white)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                width: '100%',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: 'var(--pkmn-panel)' }}>(not set)</option>
                            {natures.map((n) => {
                                const labelBase = n.name ? (n.name.charAt(0).toUpperCase() + n.name.slice(1)) : '';
                                return (
                                    <option key={n.name} value={labelBase} style={{ background: 'var(--pkmn-panel)' }}>
                                        {labelBase || '(not set)'}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Ability</span>
                        <input
                            type="text"
                            className="info-value-input"
                            onChange={onChangeHandler}
                            value={pokemon.ability}
                            name="ability"
                            placeholder="—"
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--pkmn-text-white)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                width: '100%',
                                textAlign: 'center',
                                padding: 0
                            }}
                        />
                    </div>
                    <div className="info-item">
                        <span className="info-label">Item</span>
                        <input
                            type="text"
                            className="info-value-input"
                            onChange={onChangeHandler}
                            value={pokemon.heldItem}
                            name="heldItem"
                            placeholder="—"
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--pkmn-text-white)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                width: '100%',
                                textAlign: 'center',
                                padding: 0
                            }}
                        />
                    </div>
                </div>

                {/* EVs - Main Section */}
                <div className="detail-ev-section">
                    <div className="section-title-row">
                        <h4 className="section-title">EVs</h4>
                        <span className="ev-total">{totalEVs}/510</span>
                    </div>
                    <div className="ev-grid">
                        {evStats.map((stat) => (
                            <div key={stat.key} className="ev-item">
                                <span className="ev-label">{stat.label}</span>
                                <div className="ev-controls ev-controls-vertical">
                                    <button 
                                        type="button"
                                        className="ev-btn ev-btn-plus"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            adjustEV(stat.key, 1);
                                        }}
                                        disabled={stat.value >= 252 || totalEVs >= 510}
                                    >
                                        +
                                    </button>
                                    <span className="ev-value">{stat.value}</span>
                                    <button 
                                        type="button"
                                        className="ev-btn ev-btn-minus"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            adjustEV(stat.key, -1);
                                        }}
                                        disabled={stat.value === 0}
                                    >
                                        −
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* IVs */}
                <div className="detail-section">
                    <h4 className="detail-section-title">Individual Values (IVs)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                            { key: 'hpIV', label: 'HP' },
                            { key: 'attackIV', label: 'Atk' },
                            { key: 'defenseIV', label: 'Def' },
                            { key: 'specialAttackIV', label: 'SpA' },
                            { key: 'specialDefenseIV', label: 'SpD' },
                            { key: 'speedIV', label: 'Spe' }
                        ].map(({ key, label }) => (
                            <div key={key} className="pokemon-stat-input-group">
                                <label className="pokemon-stat-label">{label}</label>
                                <input
                                    type="number"
                                    className="pokemon-stat-input"
                                    min="0"
                                    max="31"
                                    onChange={onChangeHandler}
                                    value={pokemon[key] ?? ''}
                                    name={key}
                                    placeholder="31"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button 
                        type="button" 
                        className="pokemon-btn-secondary"
                        onClick={onCancel}
                        disabled={submitting}
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="pokemon-btn-primary"
                        disabled={submitting}
                        style={{ flex: 1 }}
                    >
                        {submitting ? 'Creating...' : 'Add Pokemon'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePokemonPanel;
