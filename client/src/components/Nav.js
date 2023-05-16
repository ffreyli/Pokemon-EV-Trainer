import React from 'react';
import {Link} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const Nav = (props) => {
    return (
        <div>
            <h1>Pokemon EV Trainer</h1>
            <ButtonGroup aria-label="Nav button group">
                <Link to={`/myPokemon`}><Button className="m-2" size="lg">My Pokemon</Button></Link>
                <Link to={`/Pokemon/new`}><Button className="m-2" size="lg">Create Pokemon</Button></Link>
            </ButtonGroup>
        </div>
    )
}

export default Nav;