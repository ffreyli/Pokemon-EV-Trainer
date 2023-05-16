import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate, useParams, Link} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const PokemonDetail = (props) => {
    const [onePokemon, setOnePokemon] = useState({});
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
    }, []);

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

    return (
        <div>
            <h2>{onePokemon.pokemonName}'s EV stats</h2>
            <Image width="200" fluid="true" src={`/sprites/pokemon/${onePokemon.pokemonSpeciesNumber}.png`} alt={`${onePokemon.pokemonSpeciesNumber}`}></Image>
            <Row>
                <Col>
                    <h3>HP: <br />{onePokemon.hpEVs}</h3>
                </Col>
                <Col>
                    <h3>Attack: <br />{onePokemon.attackEVs}</h3>
                </Col>
                <Col>
                    <h3>Defense: <br />{onePokemon.defenseEVs}</h3>
                </Col>
                <Col>
                    <h3>Special Attack: <br />{onePokemon.specialAttackEVs}</h3>
                </Col>
                <Col>
                    <h3>Special Defense: <br />{onePokemon.specialDefenseEVs}</h3>
                </Col>
                <Col>
                    <h3>Speed: <br />{onePokemon.speedEVs}</h3>
                </Col>
            </Row>
            <Link to={`/Pokemon/${onePokemon._id}/edit`}>
                <Button className="m-2" variant="secondary">Edit</Button>
            </Link>
            <Button className="m-2" variant="danger" onClick={() => deleteHandler(onePokemon._id)}>Delete Pokemon</Button>
        </div>
    )
}

export default PokemonDetail;
