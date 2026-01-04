import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

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
    const [natures, setNatures] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        // Fetch species list from backend (cached) to avoid calling PokeAPI from the browser.
        axios.get('http://localhost:8000/api/pokemon-species')
            .then((response) => {
                setAllPokemonSpecies(response.data || []);
            })
            .catch((err) => {
                console.log(err);
                setAllPokemonSpecies([]);
            });
    }, [])

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

    useEffect(() => {
        axios.get('http://localhost:8000/api/onePokemon/' + id)
        .then((response) => {
            setPokemon(response.data);
            console.log(response.data.pokemonName);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [])

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

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.put('http://localhost:8000/api/updatePokemon/' + id, pokemon)
        .then((response) => {
            console.log(response);
            navigate("/Pokemon/" + id);
        })
        .catch((err) => {
            console.log(err);
            setErrors(err.response.data.errors);
        })
    }

    return (
        <div>
            <h2>Update an existing Pokemon</h2>
            {(() => {
                const n = parseInt(pokemon.pokemonSpeciesNumber);
                const validLower = !Number.isNaN(n) && n >= 1;
                const validUpper = typeof props?.maxPokemonId === 'number' ? (n <= props.maxPokemonId) : true;
                const src = validLower && validUpper ? `/sprites/pokemon/${n}.png` : '';
                return <Image width="200" fluid="true" src={src} alt={`${pokemon.pokemonSpeciesNumber}`}></Image>;
            })()}
            <Form onSubmit={onSubmitHandler}>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Pokemon Name:</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.pokemonName} name="pokemonName"/>
                            {
                                errors.pokemonName?
                                <span><br />{errors.pokemonName.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Pokemon Species:</Form.Label>
                            <Form.Select onChange={onChangeHandler} value={pokemon.pokemonSpeciesNumber} name="pokemonSpeciesNumber">
                                {
                                    allPokemonSpecies.map((pokemonSpecies) => {
                                        return (
                                            <option key={pokemonSpecies.speciesNumber} value={pokemonSpecies.speciesNumber}>
                                                {pokemonSpecies.name}
                                            </option>
                                        )
                                    })
                                }
                            </Form.Select>
                            {
                                errors.pokemonSpeciesNumber?
                                <span><br />{errors.pokemonSpeciesNumber.message}</span>:
                                null
                            }
                        </Form.Group>
                    </Row>
                    <Form.Group>
                        <Form.Label>Description(optional):</Form.Label>
                        <Form.Control type="text" onChange={onChangeHandler} value={pokemon.description} name="description"/>
                        {
                            errors.description?
                            <span><br />{errors.description.message}</span>:
                            null
                        }
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Level (1-100):</Form.Label>
                        <Form.Control type="number" min="1" max="100" onChange={onChangeHandler} value={pokemon.level} name="level"/>
                        {
                            errors.level?
                            <span><br />{errors.level.message}</span>:
                            null
                        }
                    </Form.Group>

                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Nature (optional):</Form.Label>
                            <Form.Select onChange={onChangeHandler} value={pokemon.nature || ''} name="nature">
                                <option value="">(not set)</option>
                                {natures.map((n) => {
                                    const labelBase = n.name ? (n.name.charAt(0).toUpperCase() + n.name.slice(1)) : '';
                                    const inc = n.increasedStat ? n.increasedStat : '—';
                                    const dec = n.decreasedStat ? n.decreasedStat : '—';
                                    const label = `${labelBase} (${inc === '—' ? 'neutral' : `+${inc}`}${dec === '—' ? '' : `, -${dec}`})`;
                                    return (
                                        <option key={n.name} value={labelBase}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Ability (optional):</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.ability || ''} name="ability" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Held Item (optional):</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.heldItem || ''} name="heldItem" />
                        </Form.Group>
                    </Row>

                    <h5 className="mt-3">IVs (optional)</h5>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>HP IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.hpIV ?? ''} name="hpIV" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Atk IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.attackIV ?? ''} name="attackIV" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Def IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.defenseIV ?? ''} name="defenseIV" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>SpA IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.specialAttackIV ?? ''} name="specialAttackIV" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>SpD IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.specialDefenseIV ?? ''} name="specialDefenseIV" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Spe IV (0-31):</Form.Label>
                            <Form.Control type="number" min="0" max="31" onChange={onChangeHandler} value={pokemon.speedIV ?? ''} name="speedIV" />
                        </Form.Group>
                    </Row>

                    <h5 className="mt-3">Moves (optional)</h5>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Move 1:</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.move1 || ''} name="move1" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Move 2:</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.move2 || ''} name="move2" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Move 3:</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.move3 || ''} name="move3" />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Move 4:</Form.Label>
                            <Form.Control type="text" onChange={onChangeHandler} value={pokemon.move4 || ''} name="move4" />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>HP EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.hpEVs} name="hpEVs"/>
                            {
                                errors.hpEVs?
                                <span><br />{errors.hpEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Attack EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.attackEVs} name="attackEVs"/>
                            {
                                errors.attackEVs?
                                <span><br />{errors.attackEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Defense EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.defenseEVs} name="defenseEVs"/>
                            {
                                errors.defenseEVs?
                                <span><br />{errors.defenseEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Special Attack EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.specialAttackEVs} name="specialAttackEVs"/>
                            {
                                errors.specialAttackEVs?
                                <span><br />{errors.specialAttackEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Special Defense EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.specialDefenseEVs} name="specialDefenseEVs"/>
                            {
                                errors.specialDefenseEVs?
                                <span><br />{errors.specialDefenseEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label>Speed EVs:</Form.Label>
                            <Form.Control type="number" onChange={onChangeHandler} value={pokemon.speedEVs} name="speedEVs"/>
                            {
                                errors.speedEVs?
                                <span><br />{errors.speedEVs.message}</span>:
                                null
                            }
                        </Form.Group>
                    </Row>
                    <Button variant="primary" type="submit">Save Pokemon</Button>
                </Form>
        </div>
    )
}

export default UpdatePokemon;