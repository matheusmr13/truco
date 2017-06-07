import React, { Component } from 'react';
import logo from './../logo.svg';
import './App.css';
import Match from './match/index.jsx'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import theme from '../theme.jsx';

injectTapEventPlugin();

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Match />
      </MuiThemeProvider>
    );
  }
}

export default App;
