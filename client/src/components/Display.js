import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Image from 'react-bootstrap/Image';

const Display = (props) => {
    const [allPokemon, setAllPokemon] = useState([]);

    const spriteUrlForSpecies = (speciesNumber) => {
        const n = parseInt(speciesNumber);
        if (Number.isNaN(n) || n < 1) return '';
        if (typeof props?.maxPokemonId === 'number' && n > props.maxPokemonId) return '';
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;
    };

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
                            const spriteUrl = pokemon?.spriteUrl || spriteUrlForSpecies(pokemon?.pokemonSpeciesNumber);
                            return (
                                <div key={index} className="col">
                                        <Link to={`/Pokemon/${pokemon.id}`}>
                                            <Image
                                                width="150"
                                                thumbnail="true"
                                                src={spriteUrl}
                                                alt={`${pokemon.pokemonSpeciesNumber}`}
                                            />
                                        </Link>
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