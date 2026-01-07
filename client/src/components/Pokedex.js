import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { spriteUrlForSpecies } from '../utils/spriteUtils';
import API_BASE_URL from '../config/api';
import './Pokedex.css';

const Pokedex = ({ selectedPokemonId, maxPokemonId, onEvsAdded }) => {
    const [allSpecies, setAllSpecies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [speciesData, setSpeciesData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [applyStatus, setApplyStatus] = useState({ loading: false, message: '', error: false });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fetch all species on mount
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/pokemon-species`)
            .then((response) => {
                setAllSpecies(response.data || []);
            })
            .catch((err) => {
                console.log(err);
                setAllSpecies([]);
            });
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch species data when selected
    useEffect(() => {
        if (!selectedSpecies) {
            setSpeciesData(null);
            return;
        }
        setLoadingData(true);
        
        // Use name for variants (contains "alolan", "galarian", etc.), otherwise use species number
        // Also handle if it's marked as a variant or if speciesNumber is 0 (synthetic variant entry)
        const nameLower = selectedSpecies.name.toLowerCase();
        const isVariant = selectedSpecies.isVariant || 
                         selectedSpecies.speciesNumber === 0 ||
                         nameLower.includes('alolan') || 
                         nameLower.includes('galarian') ||
                         nameLower.includes('hisuian') ||
                         nameLower.includes('paldean');
        
        const identifier = isVariant
            ? selectedSpecies.name.toLowerCase().replace(/\s+/g, '-')
            : selectedSpecies.speciesNumber;
        
        axios.get(`${API_BASE_URL}/api/pokemon-species/${identifier}`)
            .then((response) => {
                setSpeciesData(response.data);
                setLoadingData(false);
            })
            .catch((err) => {
                console.log(err);
                // If name lookup fails, try with species number as fallback
                if (identifier !== selectedSpecies.speciesNumber) {
                    axios.get(`${API_BASE_URL}/api/pokemon-species/${selectedSpecies.speciesNumber}`)
                        .then((response) => {
                            setSpeciesData(response.data);
                            setLoadingData(false);
                        })
                        .catch((fallbackErr) => {
                            console.log(fallbackErr);
                            setSpeciesData(null);
                            setLoadingData(false);
                        });
                } else {
                    setSpeciesData(null);
                    setLoadingData(false);
                }
            });
    }, [selectedSpecies]);

    // Filter species based on search
    const filteredSpecies = useMemo(() => {
        if (!searchQuery.trim()) {
            return allSpecies.slice(0, 50);
        }
        const query = searchQuery.toLowerCase();
        const filtered = allSpecies.filter(species =>
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
                const baseSpecies = allSpecies.find(s => 
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
        
        return filtered.slice(0, 50);
    }, [allSpecies, searchQuery]);

    const handleSpeciesSelect = (species) => {
        setSelectedSpecies(species);
        setSearchQuery(species.name);
        setDropdownOpen(false);
        setApplyStatus({ loading: false, message: '', error: false });
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        setDropdownOpen(true);
        setSelectedSpecies(null);
        setSpeciesData(null);
    };

    const handleInputFocus = () => {
        setDropdownOpen(true);
    };

    const handleApplyEvYield = async () => {
        if (!selectedPokemonId || !speciesData?.evYield) {
            setApplyStatus({ loading: false, message: 'Select a Pokemon first', error: true });
            return;
        }

        setApplyStatus({ loading: true, message: '', error: false });

        try {
            const response = await axios.post(`${API_BASE_URL}/api/pokemon/${selectedPokemonId}/add-evs`, {
                hpEVs: speciesData.evYield.hp || 0,
                attackEVs: speciesData.evYield.attack || 0,
                defenseEVs: speciesData.evYield.defense || 0,
                specialAttackEVs: speciesData.evYield.specialAttack || 0,
                specialDefenseEVs: speciesData.evYield.specialDefense || 0,
                speedEVs: speciesData.evYield.speed || 0
            });

            const added = response.data.added;
            const addedStr = Object.entries(added)
                .filter(([_, v]) => v > 0)
                .map(([k, v]) => `+${v} ${k}`)
                .join(', ');

            setApplyStatus({ 
                loading: false, 
                message: addedStr ? `Added: ${addedStr}` : 'No EVs added (at cap)', 
                error: false 
            });

            if (onEvsAdded) {
                onEvsAdded(response.data.pokemon);
            }

            // Clear message after 3 seconds
            setTimeout(() => {
                setApplyStatus(prev => prev.message ? { ...prev, message: '' } : prev);
            }, 3000);
        } catch (err) {
            const errorMsg = err?.response?.data?.error || 'Failed to add EVs';
            setApplyStatus({ loading: false, message: errorMsg, error: true });
        }
    };

    // Format EV yield for display
    const formatEvYield = (evYield) => {
        if (!evYield) return null;
        const yields = [];
        if (evYield.hp > 0) yields.push({ stat: 'HP', value: evYield.hp });
        if (evYield.attack > 0) yields.push({ stat: 'Atk', value: evYield.attack });
        if (evYield.defense > 0) yields.push({ stat: 'Def', value: evYield.defense });
        if (evYield.specialAttack > 0) yields.push({ stat: 'SpA', value: evYield.specialAttack });
        if (evYield.specialDefense > 0) yields.push({ stat: 'SpD', value: evYield.specialDefense });
        if (evYield.speed > 0) yields.push({ stat: 'Spe', value: evYield.speed });
        return yields;
    };

    const evYieldDisplay = speciesData ? formatEvYield(speciesData.evYield) : null;

    return (
        <div className="rotom-phone-container">
            <div className="rotom-antenna"></div>
            <div className="pokedex-panel">
                <div className="pokedex-header">
                    <h4 className="pokedex-title">Pokedex</h4>
                    <span className="pokedex-subtitle">EV Yield Lookup</span>
                </div>

                {/* Search Input */}
                <div className="pokedex-search">
                    <input
                        ref={inputRef}
                        type="text"
                        className="pokedex-search-input"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder="Search Pokemon..."
                        autoComplete="off"
                    />
                    {dropdownOpen && (
                        <div ref={dropdownRef} className="pokedex-dropdown">
                            {filteredSpecies.length === 0 ? (
                                <div className="pokedex-dropdown-item no-results">
                                    No Pokemon found
                                </div>
                            ) : (
                                filteredSpecies.map((species) => {
                                    // For variants, use a placeholder or try to construct variant sprite URL
                                    const spriteUrl = species.isVariant && species.speciesNumber === 0
                                        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png` // Placeholder
                                        : spriteUrlForSpecies(species.speciesNumber, maxPokemonId);
                                    
                                    return (
                                        <div
                                            key={`${species.speciesNumber}-${species.name}`}
                                            className={`pokedex-dropdown-item ${selectedSpecies?.speciesNumber === species.speciesNumber && selectedSpecies?.name === species.name ? 'selected' : ''}`}
                                            onClick={() => handleSpeciesSelect(species)}
                                        >
                                            <img
                                                src={spriteUrl}
                                                alt={species.name}
                                                className="pokedex-dropdown-sprite"
                                                onError={(e) => {
                                                    // Hide broken images for variants until data loads
                                                    if (species.isVariant) {
                                                        e.target.style.display = 'none';
                                                    }
                                                }}
                                            />
                                            <span className="pokedex-dropdown-number">#{species.speciesNumber || '?'}</span>
                                            <span className="pokedex-dropdown-name">{species.name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Species Info */}
                {selectedSpecies && (
                    <div className="pokedex-info">
                        {loadingData ? (
                            <div className="pokedex-loading">
                                <div className="pokedex-spinner"></div>
                            </div>
                        ) : speciesData ? (
                            <>
                                {/* Species Header */}
                                <div className="pokedex-species-header">
                                    <img
                                        src={speciesData.spriteUrl || spriteUrlForSpecies(speciesData.pokemonId || speciesData.speciesNumber || selectedSpecies.speciesNumber, maxPokemonId)}
                                        alt={selectedSpecies.name}
                                        className="pokedex-sprite"
                                        onError={(e) => {
                                            // Fallback to base sprite if variant sprite fails
                                            if (selectedSpecies.speciesNumber > 0) {
                                                e.target.src = spriteUrlForSpecies(selectedSpecies.speciesNumber, maxPokemonId);
                                            }
                                        }}
                                    />
                                    <div className="pokedex-species-info">
                                        <span className="pokedex-species-name">{selectedSpecies.name}</span>
                                        <span className="pokedex-species-number">#{speciesData.pokemonId || speciesData.speciesNumber || selectedSpecies.speciesNumber}</span>
                                    </div>
                                </div>

                                {/* Types */}
                                {speciesData.types && (
                                    <div className="pokedex-types">
                                        {speciesData.types.map((type, idx) => (
                                            <span key={idx} className={`pokedex-type type-${type}`}>
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* EV Yield - The main feature */}
                                <div className="pokedex-ev-section">
                                    <div className="pokedex-ev-title">EV Yield</div>
                                    <div className="pokedex-ev-yields">
                                        {evYieldDisplay && evYieldDisplay.length > 0 ? (
                                            evYieldDisplay.map((ev, idx) => (
                                                <div key={idx} className="pokedex-ev-badge">
                                                    <span className="ev-value">+{ev.value}</span>
                                                    <span className="ev-stat">{ev.stat}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="pokedex-no-yield">No EV yield</span>
                                        )}
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <button
                                    className="pokedex-apply-btn"
                                    onClick={handleApplyEvYield}
                                    disabled={!selectedPokemonId || applyStatus.loading || !evYieldDisplay?.length}
                                >
                                    {applyStatus.loading ? 'Adding...' : 'Add to Selected Pokemon'}
                                </button>

                                {/* Status Message */}
                                {applyStatus.message && (
                                    <div className={`pokedex-status ${applyStatus.error ? 'error' : 'success'}`}>
                                        {applyStatus.message}
                                    </div>
                                )}

                                {!selectedPokemonId && (
                                    <div className="pokedex-hint">
                                        Select a Pokemon in the box to add EVs
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="pokedex-error">Failed to load data</div>
                        )}
                    </div>
                )}

                {!selectedSpecies && (
                    <div className="pokedex-empty">
                        Search for a Pokemon to see its EV yield
                    </div>
                )}
            </div>
            <div className="rotom-tail"></div>
        </div>
    );
};

export default Pokedex;
