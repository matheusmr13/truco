import React, {Component} from 'react';

class Button extends Component {
  render() {
    return (
      <button>{this.props.label}</button>
    );
  }
}

export default Button;
