import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Image from 'react-bootstrap/Image';

const Display = (props) => {
    const [allPokemon, setAllPokemon] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/allPokemon')
        .then((response) => {
            console.log(response);
            setAllPokemon(response.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }, [])

    return (
        <div>
            <h2>My Pokemon</h2>
            <div className="container text-center">
                <div className="row row-cols-5">
                    {
                        allPokemon.map((pokemon, index) => {
                            return (
                                <div key={index} className="col">
                                        <Link to={`/Pokemon/${pokemon._id}`}><Image width="150" thumbnail="true" src={`./sprites/pokemon/${pokemon.pokemonSpeciesNumber}.png`} alt={`${pokemon.speciesNumber}`}></Image></Link>
                                        <h3>{pokemon.pokemonName}</h3>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default Display;