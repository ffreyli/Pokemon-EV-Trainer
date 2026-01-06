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
        setUserHasSearched(true);
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

    const spriteUrl = spriteUrlForSpecies(pokemon.pokemonSpeciesNumber, maxPokemonId);

    return (
        <div className="detail-panel">
            {/* Header */}
            <div className="detail-header">
                <div className="detail-sprite-circle">
                    <img src={spriteUrl} alt="New Pokemon" className="detail-sprite" />
                </div>
                <div className="detail-name-section">
                    <h3 className="detail-pokemon-name">New Pokemon</h3>
                    <span className="detail-level-badge">Create</span>
                </div>
            </div>

            <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Basic Info */}
                <div className="detail-section">
                    <h4 className="detail-section-title">Basic Info</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                                                {filteredSpecies.slice(0, 50).map((species) => (
                                                    <div
                                                        key={species.speciesNumber}
                                                        className={`pokemon-species-option ${species.speciesNumber === pokemon.pokemonSpeciesNumber ? 'selected' : ''}`}
                                                        onClick={() => handleSpeciesSelect(species)}
                                                    >
                                                        <img 
                                                            src={spriteUrlForSpecies(species.speciesNumber, maxPokemonId)} 
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

                {/* Traits */}
                <div className="detail-section">
                    <h4 className="detail-section-title">Traits</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

                {/* EVs */}
                <div className="detail-section">
                    <h4 className="detail-section-title">Effort Values (EVs)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                            { key: 'hpEVs', label: 'HP' },
                            { key: 'attackEVs', label: 'Atk' },
                            { key: 'defenseEVs', label: 'Def' },
                            { key: 'specialAttackEVs', label: 'SpA' },
                            { key: 'specialDefenseEVs', label: 'SpD' },
                            { key: 'speedEVs', label: 'Spe' }
                        ].map(({ key, label }) => (
                            <div key={key} className="pokemon-stat-input-group">
                                <label className="pokemon-stat-label">{label}</label>
                                <input
                                    type="number"
                                    className="pokemon-stat-input"
                                    min="0"
                                    max="252"
                                    onChange={onChangeHandler}
                                    value={pokemon[key]}
                                    name={key}
                                />
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
