import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {useNavigate, useParams, Link} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

const PokemonDetail = (props) => {
    const [onePokemon, setOnePokemon] = useState({});
    const [natures, setNatures] = useState([]);
    const [spriteUrl, setSpriteUrl] = useState('');
    const [applyItem, setApplyItem] = useState({ itemName: 'protein', quantity: 1 });
    const [applyItemStatus, setApplyItemStatus] = useState({ loading: false, error: '', warnings: [] });
    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/api/onePokemon/' + id)
            .then((response) => {
                console.log(response.data);
                setOnePokemon(response.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, [id]);

    useEffect(() => {
        const n = parseInt(onePokemon?.pokemonSpeciesNumber);
        if (Number.isNaN(n) || n < 1) {
            setSpriteUrl('');
            return;
        }
        axios.get(`http://localhost:8000/api/pokemon-sprite/${n}`)
            .then((response) => {
                setSpriteUrl(response.data?.spriteUrl || '');
            })
            .catch((err) => {
                console.log(err);
                setSpriteUrl('');
            });
    }, [onePokemon?.pokemonSpeciesNumber]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/natures')
            .then((response) => {
                setNatures(response.data || []);
            })
            .catch((err) => {
                console.log(err);
                setNatures([]);
            });
    }, []);

    const natureEffects = useMemo(() => {
        // Build map from cached PokeAPI data.
        // Keys are TitleCase (e.g. "Adamant") to match what's stored from the dropdown.
        const map = {};

        // Mapping from PokeAPI stat names to our internal stat keys
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

    const hasAllIVs = (p) => {
        const ivKeys = ['hpIV', 'attackIV', 'defenseIV', 'specialAttackIV', 'specialDefenseIV', 'speedIV'];
        return ivKeys.every((k) => typeof p?.[k] === 'number' && !Number.isNaN(p[k]));
    };

    const canCalculateFinalStats = () => {
        if (!onePokemon?.baseStats) return false;
        if (typeof onePokemon?.level !== 'number' || Number.isNaN(onePokemon.level)) return false;
        if (!onePokemon?.nature) return false;
        if (!hasAllIVs(onePokemon)) return false;
        // Nature must be recognized for exact calc
        if (!natureEffects[onePokemon.nature]) return false;
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

        const level = onePokemon.level;
        const nature = onePokemon.nature;

        return {
            hp: calculateHP(onePokemon.baseStats.hp, onePokemon.hpIV, onePokemon.hpEVs || 0, level),
            attack: calculateOtherStat(
                onePokemon.baseStats.attack,
                onePokemon.attackIV,
                onePokemon.attackEVs || 0,
                level,
                getNatureMultiplier(nature, 'attack')
            ),
            defense: calculateOtherStat(
                onePokemon.baseStats.defense,
                onePokemon.defenseIV,
                onePokemon.defenseEVs || 0,
                level,
                getNatureMultiplier(nature, 'defense')
            ),
            specialAttack: calculateOtherStat(
                onePokemon.baseStats.specialAttack,
                onePokemon.specialAttackIV,
                onePokemon.specialAttackEVs || 0,
                level,
                getNatureMultiplier(nature, 'specialAttack')
            ),
            specialDefense: calculateOtherStat(
                onePokemon.baseStats.specialDefense,
                onePokemon.specialDefenseIV,
                onePokemon.specialDefenseEVs || 0,
                level,
                getNatureMultiplier(nature, 'specialDefense')
            ),
            speed: calculateOtherStat(
                onePokemon.baseStats.speed,
                onePokemon.speedIV,
                onePokemon.speedEVs || 0,
                level,
                getNatureMultiplier(nature, 'speed')
            )
        };
    };

    const calculatedStats = calculateAllStats();

    const deleteHandler = (id) => {
        axios.delete('http://localhost:8000/api/deletePokemon/' + id)
        .then((response) => {
            console.log(response);
            navigate("/myPokemon");
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const applyItemHandler = async (e) => {
        e.preventDefault();
        setApplyItemStatus({ loading: true, error: '', warnings: [] });
        try {
            const resp = await axios.post(`http://localhost:8000/api/pokemon/${id}/apply-item`, {
                itemName: applyItem.itemName,
                quantity: applyItem.quantity
            });
            setOnePokemon(resp.data.pokemon);
            setApplyItemStatus({ loading: false, error: '', warnings: resp.data.warnings || [] });
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to apply item';
            setApplyItemStatus({ loading: false, error: msg, warnings: [] });
        }
    };

    return (
        <div>
            <h2>{onePokemon.pokemonName}'s Stats</h2>
            {(() => {
                const n = parseInt(onePokemon.pokemonSpeciesNumber);
                const validLower = !Number.isNaN(n) && n >= 1;
                const validUpper = typeof props?.maxPokemonId === 'number' ? (n <= props.maxPokemonId) : true;
                const src = validLower && validUpper ? (spriteUrl || '') : '';
                return <Image width="200" fluid="true" src={src} alt={`${onePokemon.pokemonSpeciesNumber}`}></Image>;
            })()}
            
            {onePokemon.types && (
                <div className="my-3">
                    <strong>Type(s): </strong>
                    {onePokemon.types.map((type, idx) => (
                        <span key={idx} className="badge bg-secondary mx-1">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                    ))}
                </div>
            )}
            
            <div className="my-3">
                <strong>Level: </strong>{onePokemon.level || 100}
            </div>

            <div className="my-2">
                <strong>Nature:</strong> {onePokemon.nature || '(not set)'} &nbsp;|&nbsp; <strong>Ability:</strong> {onePokemon.ability || '(not set)'} &nbsp;|&nbsp; <strong>Held Item:</strong> {onePokemon.heldItem || '(not set)'}
            </div>

            <div className="my-2">
                <strong>Moves:</strong>{' '}
                {[onePokemon.move1, onePokemon.move2, onePokemon.move3, onePokemon.move4].filter(Boolean).length > 0
                    ? [onePokemon.move1, onePokemon.move2, onePokemon.move3, onePokemon.move4]
                          .filter(Boolean)
                          .join(', ')
                    : '(not set)'}
            </div>

            <h3 className="mt-4">Stats Overview</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Stat</th>
                        <th>Base</th>
                        <th>IV</th>
                        <th>EVs</th>
                        <th>Final Value (in-game)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>HP</strong></td>
                        <td>{onePokemon.baseStats?.hp || '---'}</td>
                        <td>{typeof onePokemon.hpIV === 'number' ? onePokemon.hpIV : '---'}</td>
                        <td>{onePokemon.hpEVs || 0}</td>
                        <td><strong>{calculatedStats?.hp || '---'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Attack</strong></td>
                        <td>{onePokemon.baseStats?.attack || '---'}</td>
                        <td>{typeof onePokemon.attackIV === 'number' ? onePokemon.attackIV : '---'}</td>
                        <td>{onePokemon.attackEVs || 0}</td>
                        <td><strong>{calculatedStats?.attack || '---'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Defense</strong></td>
                        <td>{onePokemon.baseStats?.defense || '---'}</td>
                        <td>{typeof onePokemon.defenseIV === 'number' ? onePokemon.defenseIV : '---'}</td>
                        <td>{onePokemon.defenseEVs || 0}</td>
                        <td><strong>{calculatedStats?.defense || '---'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Special Attack</strong></td>
                        <td>{onePokemon.baseStats?.specialAttack || '---'}</td>
                        <td>{typeof onePokemon.specialAttackIV === 'number' ? onePokemon.specialAttackIV : '---'}</td>
                        <td>{onePokemon.specialAttackEVs || 0}</td>
                        <td><strong>{calculatedStats?.specialAttack || '---'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Special Defense</strong></td>
                        <td>{onePokemon.baseStats?.specialDefense || '---'}</td>
                        <td>{typeof onePokemon.specialDefenseIV === 'number' ? onePokemon.specialDefenseIV : '---'}</td>
                        <td>{onePokemon.specialDefenseEVs || 0}</td>
                        <td><strong>{calculatedStats?.specialDefense || '---'}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Speed</strong></td>
                        <td>{onePokemon.baseStats?.speed || '---'}</td>
                        <td>{typeof onePokemon.speedIV === 'number' ? onePokemon.speedIV : '---'}</td>
                        <td>{onePokemon.speedEVs || 0}</td>
                        <td><strong>{calculatedStats?.speed || '---'}</strong></td>
                    </tr>
                </tbody>
            </Table>
            
            <p className="text-muted small">
                {calculatedStats
                    ? `* Final values calculated at Level ${onePokemon.level} using the stored IVs and nature (${onePokemon.nature}).`
                    : '* Fill in Nature + all 6 IVs to enable exact in-game stat calculation.'}
            </p>

            <h3 className="mt-4">Apply EV Item</h3>
            <Form onSubmit={applyItemHandler}>
                <Row className="mb-2">
                    <Col md={6}>
                        <Form.Label>Item</Form.Label>
                        <Form.Select
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
                                <option value="fresh-start-mochi">Fresh-Start Mochi (Reset EVs)</option>
                            </optgroup>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label>Qty</Form.Label>
                        <Form.Control
                            type="number"
                            min="1"
                            value={applyItem.quantity}
                            onChange={(e) => setApplyItem({ ...applyItem, quantity: parseInt(e.target.value || '1') })}
                        />
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                        <Button type="submit" variant="primary" disabled={applyItemStatus.loading}>
                            {applyItemStatus.loading ? 'Applying...' : 'Apply'}
                        </Button>
                    </Col>
                </Row>
                {applyItemStatus.error ? (
                    <div className="text-danger small">{applyItemStatus.error}</div>
                ) : null}
                {applyItemStatus.warnings?.length ? (
                    <div className="text-warning small">
                        {applyItemStatus.warnings.join(' ')}
                    </div>
                ) : null}
            </Form>

            <Link to={`/Pokemon/${onePokemon.id}/edit`}>
                <Button className="m-2" variant="secondary">Edit</Button>
            </Link>
            <Button className="m-2" variant="danger" onClick={() => deleteHandler(onePokemon.id)}>Delete Pokemon</Button>
        </div>
    )
}

export default PokemonDetail;
