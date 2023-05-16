import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

const CreatePokemon = () => {
    const [pokemon, setPokemon] = useState({
        pokemonName: '',
        pokemonSpeciesNumber: 1,
        description: '',
        hpEVs: 0,
        attackEVs: 0,
        defenseEVs: 0,
        specialAttackEVs: 0,
        specialDefenseEVs: 0,
        speedEVs: 0
    });
    const [allPokemonSpecies, setAllPokemonSpecies] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://pokeapi.co/api/v2/pokemon/?limit=1010')
        .then((response) => {
            setAllPokemonSpecies(response.data.results);
            console.log(response.data.results);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [])

    const onChangeHandler = (e) => {
        setPokemon({...pokemon, [e.target.name]: e.target.value})
    }

    const onSubmitHandler = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/newPokemon', pokemon)
        .then((response) => {
            console.log(response);
            navigate("/myPokemon");
        })
        .catch((err) => {
            console.log(err);
            setErrors(err.response.data.errors);
        })
    }

    return (
        <div>
            <h2>Create a Pokemon to track their EVs!</h2>
            <Image width="200" fluid="true" src={`/sprites/pokemon/${pokemon.pokemonSpeciesNumber}.png`} alt={`${pokemon.pokemonSpeciesNumber}`}></Image>
            <div className="container text-center">
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
                                    allPokemonSpecies.map((pokemonSpecies, index) => {
                                        return (
                                            <option key={index} value={index + 1}>{pokemonSpecies.name}</option>
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
                    <Button variant="primary" type="submit">Add Pokemon</Button>
                </Form>
            </div>
        </div>
    )
}

export default CreatePokemon;