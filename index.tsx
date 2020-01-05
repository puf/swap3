import React, { Component } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import Match3Game from './Match3Game';
import './style.css';

interface AppProps { }
interface AppState {
  name: string;
}

class App extends Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      name: 'swappers'
    };
  }

  componentDidMount() {
    const img = this.refs.gemsImg;
    console.log(img);
  }

  render() {
    return (
      <div>
        <Hello name={this.state.name} />
        <Match3Game rowCount={10} colCount={5} gemSpriteUrl="https://opengameart.org/sites/default/files/crystals3216all.png" />
        <img id="gemsImg" ref="gemsImg" style={{ display: "none" }}src="https://opengameart.org/sites/default/files/crystals3216all.png"></img>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
