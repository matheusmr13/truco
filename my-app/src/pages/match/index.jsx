import React, { Component } from 'react';
import MatchList from './list.jsx'
import NewMatch from './new.jsx'

class Match extends Component {
  render() {
    return (
		<div>
			<MatchList />
			<NewMatch />
		</div>
    );
  }
}

export default Match;
