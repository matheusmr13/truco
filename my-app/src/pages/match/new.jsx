import React, { Component } from 'react';
import Input from './../../components/Input.jsx'
import Button from './../../components/Button.jsx'
import RaisedButton from 'material-ui/RaisedButton';

class NewMatch extends Component {
  render() {
    return (
      <div>
        <Input label="Name" type="text"/>
        <Input label="Max players" type="number"/>
        <Input label="Password" type="password"/>

		    <RaisedButton label="Criar" primary/>
      </div>
    );
  }
}

export default NewMatch;
