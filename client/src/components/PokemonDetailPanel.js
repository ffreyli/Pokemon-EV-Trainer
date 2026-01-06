import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import './PokemonDetailPanel.css';

const PokemonDetailPanel = ({ pokemonId, maxPokemonId, onPokemonDeleted, onPokemonUpdated }) => {
    const [pokemon, setPokemon] = useState(null);
    const [natures, setNatures] = useState([]);
    const [applyItem, setApplyItem] = useState({ itemName: 'protein', quantity: 1 });
    const [applyItemStatus, setApplyItemStatus] = useState({ loading: false, error: '', warnings: [] });
    const [loading, setLoading] = useState(false);
    const [evUpdateStatus, setEvUpdateStatus] = useState({ loading: false, error: '' });

    useEffect(() => {
        if (!pokemonId) {
            setPokemon(null);
            return;
        }
        setLoading(true);
        axios.get(`${API_BASE_URL}/api/onePokemon/${pokemonId}`)
            .then((response) => {
                setPokemon(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, [pokemonId]);

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

    const natureEffects = useMemo(() => {
        const map = {};
        const statMap = {
            attack: 'attack',
            defense: 'defense',
            speed: 'speed',
            'special-attack': 'specialAttack',
            'special-defense': 'specialDefense',
            hp: 'hp'
        };

        (natures || []).forEach((n) => {
            const title = n?.name ? (n.name.charAt(0).toUpperCase() + n.name.slice(1)) : null;
            if (!title) return;
            const up = n.increasedStat ? statMap[n.increasedStat] || null : null;
            const down = n.decreasedStat ? statMap[n.decreasedStat] || null : null;
            map[title] = { up, down };
        });

        return map;
    }, [natures]);

    const getNatureMultiplier = (nature, statKey) => {
        const effect = natureEffects[nature];
        if (!effect || !statKey) return null;
        if (effect.up === statKey) return 1.1;
        if (effect.down === statKey) return 0.9;
        return 1.0;
    };

    const canCalculateFinalStats = () => {
        if (!pokemon?.baseStats) return false;
        if (typeof pokemon?.level !== 'number' || Number.isNaN(pokemon.level)) return false;
        if (!pokemon?.nature) return false;
        if (!natureEffects[pokemon.nature]) return false;
        return true;
    };

    const calculateHP = (baseStat, iv, ev, level) => {
        return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    };

    const calculateOtherStat = (baseStat, iv, ev, level, natureMultiplier) => {
        const preNature = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
        return Math.floor(preNature * natureMultiplier);
    };

    const calculateAllStats = () => {
        if (!canCalculateFinalStats()) return null;
        const level = pokemon.level;
        const nature = pokemon.nature;

        return {
            hp: calculateHP(pokemon.baseStats.hp, pokemon.hpIV, pokemon.hpEVs || 0, level),
            attack: calculateOtherStat(pokemon.baseStats.attack, pokemon.attackIV, pokemon.attackEVs || 0, level, getNatureMultiplier(nature, 'attack')),
            defense: calculateOtherStat(pokemon.baseStats.defense, pokemon.defenseIV, pokemon.defenseEVs || 0, level, getNatureMultiplier(nature, 'defense')),
            specialAttack: calculateOtherStat(pokemon.baseStats.specialAttack, pokemon.specialAttackIV, pokemon.specialAttackEVs || 0, level, getNatureMultiplier(nature, 'specialAttack')),
            specialDefense: calculateOtherStat(pokemon.baseStats.specialDefense, pokemon.specialDefenseIV, pokemon.specialDefenseEVs || 0, level, getNatureMultiplier(nature, 'specialDefense')),
            speed: calculateOtherStat(pokemon.baseStats.speed, pokemon.speedIV, pokemon.speedEVs || 0, level, getNatureMultiplier(nature, 'speed'))
        };
    };

    const calculatedStats = calculateAllStats();

    // Calculate total EVs
    const totalEVs = pokemon ? 
        (pokemon.hpEVs || 0) + (pokemon.attackEVs || 0) + (pokemon.defenseEVs || 0) + 
        (pokemon.specialAttackEVs || 0) + (pokemon.specialDefenseEVs || 0) + (pokemon.speedEVs || 0) : 0;

    const deleteHandler = () => {
        if (!pokemon?.id) return;
        axios.delete(`${API_BASE_URL}/api/deletePokemon/${pokemon.id}`)
            .then((response) => {
                console.log(response);
                if (onPokemonDeleted) onPokemonDeleted(pokemon.id);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const applyItemHandler = async (e) => {
        e.preventDefault();
        if (!pokemon?.id) return;
        setApplyItemStatus({ loading: true, error: '', warnings: [] });
        try {
            const resp = await axios.post(`${API_BASE_URL}/api/pokemon/${pokemon.id}/apply-item`, {
                itemName: applyItem.itemName,
                quantity: applyItem.quantity
            });
            setPokemon(resp.data.pokemon);
            setApplyItemStatus({ loading: false, error: '', warnings: resp.data.warnings || [] });
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to apply item';
            setApplyItemStatus({ loading: false, error: msg, warnings: [] });
        }
    };

    // EV adjustment handler
    const adjustEV = async (statKey, delta) => {
        if (!pokemon?.id) return;
        
        const evFieldMap = {
            hp: 'hpEVs',
            attack: 'attackEVs',
            defense: 'defenseEVs',
            specialAttack: 'specialAttackEVs',
            specialDefense: 'specialDefenseEVs',
            speed: 'speedEVs'
        };
        
        const field = evFieldMap[statKey];
        const currentValue = pokemon[field] || 0;
        const newValue = Math.max(0, Math.min(252, currentValue + delta));
        
        // Check total EV limit (510)
        const newTotal = totalEVs - currentValue + newValue;
        if (newTotal > 510) {
            setEvUpdateStatus({ loading: false, error: 'Total EVs cannot exceed 510' });
            setTimeout(() => setEvUpdateStatus({ loading: false, error: '' }), 2000);
            return;
        }
        
        if (newValue === currentValue) return;
        
        setEvUpdateStatus({ loading: true, error: '' });
        
        try {
            const resp = await axios.put(`${API_BASE_URL}/api/updatePokemon/${pokemon.id}`, {
                ...pokemon,
                [field]: newValue
            });
            // Preserve baseStats, types, and other enriched data from PokeAPI
            const updatedPokemon = {
                ...resp.data,
                baseStats: pokemon.baseStats,
                types: pokemon.types,
                evYield: pokemon.evYield
            };
            setPokemon(updatedPokemon);
            if (onPokemonUpdated) onPokemonUpdated(updatedPokemon);
            setEvUpdateStatus({ loading: false, error: '' });
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to update EV';
            setEvUpdateStatus({ loading: false, error: msg });
        }
    };

    if (!pokemonId) {
        return (
            <div className="detail-panel">
                <div className="detail-panel-empty">
                    <p>Select a Pokemon to view details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="detail-panel">
                <div className="detail-panel-empty">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!pokemon) {
        return (
            <div className="detail-panel">
                <div className="detail-panel-empty">
                    <p>Pokemon not found</p>
                </div>
            </div>
        );
    }

    const spriteUrl = spriteUrlForSpecies(pokemon?.pokemonSpeciesNumber, maxPokemonId);

    // EV data for rendering
    const evStats = [
        { key: 'hp', label: 'HP', value: pokemon.hpEVs || 0 },
        { key: 'attack', label: 'Atk', value: pokemon.attackEVs || 0 },
        { key: 'defense', label: 'Def', value: pokemon.defenseEVs || 0 },
        { key: 'specialAttack', label: 'SpA', value: pokemon.specialAttackEVs || 0 },
        { key: 'specialDefense', label: 'SpD', value: pokemon.specialDefenseEVs || 0 },
        { key: 'speed', label: 'Spe', value: pokemon.speedEVs || 0 },
    ];

    return (
        <div className="detail-panel">
            {/* Header with sprite */}
            <div className="detail-header">
                <div className="detail-sprite-circle">
                    <img
                        className="detail-sprite"
                        src={spriteUrl}
                        alt={pokemon.pokemonName}
                    />
                </div>
                <div className="detail-name-section">
                    <h3 className="detail-pokemon-name">{pokemon.pokemonName}</h3>
                    {pokemon.level && (
                        <span className="detail-level-badge">Lv. {pokemon.level}</span>
                    )}
                </div>
            </div>

            {/* Types */}
            {pokemon.types && (
                <div className="detail-types">
                    {pokemon.types.map((type, idx) => (
                        <span key={idx} className={`type-badge type-${type}`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                    ))}
                </div>
            )}

            {/* Info Row */}
            <div className="detail-info-row">
                <div className="info-item">
                    <span className="info-label">Nature</span>
                    <span className="info-value">{pokemon.nature || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Ability</span>
                    <span className="info-value">{pokemon.ability || '—'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Item</span>
                    <span className="info-value">{pokemon.heldItem || '—'}</span>
                </div>
            </div>

            {/* EV Quick Adjust Section */}
            <div className="detail-ev-section">
                <div className="section-title-row">
                    <h4 className="section-title">EVs</h4>
                    <span className="ev-total">{totalEVs}/510</span>
                </div>
                {evUpdateStatus.error && (
                    <div className="ev-error">{evUpdateStatus.error}</div>
                )}
                <div className="ev-grid">
                    {evStats.map((stat) => (
                        <div key={stat.key} className="ev-item">
                            <span className="ev-label">{stat.label}</span>
                            <div className="ev-controls">
                                <button 
                                    className="ev-btn ev-btn-minus"
                                    onClick={() => adjustEV(stat.key, -1)}
                                    disabled={evUpdateStatus.loading || stat.value === 0}
                                >
                                    -
                                </button>
                                <span className="ev-value">{stat.value}</span>
                                <button 
                                    className="ev-btn ev-btn-plus"
                                    onClick={() => adjustEV(stat.key, 1)}
                                    disabled={evUpdateStatus.loading || stat.value >= 252 || totalEVs >= 510}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Table */}
            <div className="detail-stats-section">
                <h4 className="section-title">Final Stats</h4>
                <div className="stats-grid">
                    <div className="stat-row stat-header">
                        <span className="stat-name"></span>
                        <span className="stat-base">Base</span>
                        <span className="stat-iv">IV</span>
                        <span className="stat-final">Total</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">HP</span>
                        <span className="stat-base">{pokemon.baseStats?.hp || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.hpIV === 'number' ? pokemon.hpIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.hp || '—'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">Attack</span>
                        <span className="stat-base">{pokemon.baseStats?.attack || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.attackIV === 'number' ? pokemon.attackIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.attack || '—'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">Defense</span>
                        <span className="stat-base">{pokemon.baseStats?.defense || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.defenseIV === 'number' ? pokemon.defenseIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.defense || '—'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">Sp. Atk</span>
                        <span className="stat-base">{pokemon.baseStats?.specialAttack || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.specialAttackIV === 'number' ? pokemon.specialAttackIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.specialAttack || '—'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">Sp. Def</span>
                        <span className="stat-base">{pokemon.baseStats?.specialDefense || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.specialDefenseIV === 'number' ? pokemon.specialDefenseIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.specialDefense || '—'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-name">Speed</span>
                        <span className="stat-base">{pokemon.baseStats?.speed || '—'}</span>
                        <span className="stat-iv">{typeof pokemon.speedIV === 'number' ? pokemon.speedIV : '—'}</span>
                        <span className="stat-final">{calculatedStats?.speed || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Moves */}
            {[pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4].filter(Boolean).length > 0 && (
                <div className="detail-moves-section">
                    <h4 className="section-title">Moves</h4>
                    <div className="moves-list">
                        {[pokemon.move1, pokemon.move2, pokemon.move3, pokemon.move4]
                            .filter(Boolean)
                            .map((move, idx) => (
                                <span key={idx} className="move-badge">{move}</span>
                            ))}
                    </div>
                </div>
            )}

            {/* Apply Item Section */}
            <div className="detail-item-section">
                <h4 className="section-title">Apply EV Item</h4>
                <form onSubmit={applyItemHandler} className="item-form">
                    <select
                        className="item-select"
                        value={applyItem.itemName}
                        onChange={(e) => setApplyItem({ ...applyItem, itemName: e.target.value })}
                    >
                        <optgroup label="Vitamins (+10)">
                            <option value="hp-up">HP Up</option>
                            <option value="protein">Protein</option>
                            <option value="iron">Iron</option>
                            <option value="calcium">Calcium</option>
                            <option value="zinc">Zinc</option>
                            <option value="carbos">Carbos</option>
                        </optgroup>
                        <optgroup label="Feathers (+1)">
                            <option value="health-feather">Health Feather</option>
                            <option value="muscle-feather">Muscle Feather</option>
                            <option value="resist-feather">Resist Feather</option>
                            <option value="genius-feather">Genius Feather</option>
                            <option value="clever-feather">Clever Feather</option>
                            <option value="swift-feather">Swift Feather</option>
                        </optgroup>
                        <optgroup label="EV-Reducing Berries (-10)">
                            <option value="pomeg-berry">Pomeg Berry</option>
                            <option value="kelpsy-berry">Kelpsy Berry</option>
                            <option value="qualot-berry">Qualot Berry</option>
                            <option value="hondew-berry">Hondew Berry</option>
                            <option value="grepa-berry">Grepa Berry</option>
                            <option value="tamato-berry">Tamato Berry</option>
                        </optgroup>
                        <optgroup label="Reset">
                            <option value="fresh-start-mochi">Fresh-Start Mochi</option>
                        </optgroup>
                    </select>
                    <input
                        type="number"
                        className="item-qty"
                        min="1"
                        value={applyItem.quantity}
                        onChange={(e) => setApplyItem({ ...applyItem, quantity: parseInt(e.target.value || '1') })}
                    />
                    <button type="submit" className="item-apply-btn" disabled={applyItemStatus.loading}>
                        {applyItemStatus.loading ? '...' : 'Apply'}
                    </button>
                </form>
                {applyItemStatus.error && (
                    <div className="item-error">{applyItemStatus.error}</div>
                )}
                {applyItemStatus.warnings?.length > 0 && (
                    <div className="item-warning">{applyItemStatus.warnings.join(' ')}</div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="detail-actions">
                <Link to={`/Pokemon/${pokemon.id}/edit`} className="detail-btn edit-btn">
                    Edit
                </Link>
                <button className="detail-btn delete-btn" onClick={deleteHandler}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default PokemonDetailPanel;
