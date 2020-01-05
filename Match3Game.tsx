import React from 'react';
import Gameboard from './Gameboard';
import Sprite from './Sprite';

interface GameState {
  screen: GameScreenState;
  lastUpdate: number;
  gameboard: Gameboard;
  gemSpites: Sprite;
}
interface GameScreenState {
  width, height, ratio: any;
}
interface GameProps { 
  rowCount: number
  colCount: number
  gemSpriteUrl: string;
}
//export default ({ name }) => <h1>Hello {name}!</h1>;
export default class Match3Game extends React.Component<GameProps, GameState> {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public canvasBoundingBox: ClientRect;

  constructor(props: GameProps){
    super(props)
    let gemSprites = new Sprite({ url: props.gemSpriteUrl, colCount: 8, rowCount: 6, spriteWidth: 32, spriteHeight: 32 })
    this.state = { 
      screen: { width: 160, height: 240, ratio: window.devicePixelRatio || 1 }, 
      lastUpdate: Date.now(),
      gameboard: new Gameboard({ colCount: props.colCount, rowCount: props.rowCount, gemSize: 32, boardPadding: 25, gemSprites }),
    } as GameState
  }
  componentDidMount() {
    this.canvas = document.getElementById("gameboard") as HTMLCanvasElement
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    this.canvasBoundingBox = this.canvas.getBoundingClientRect();
    // start our game loop
    requestAnimationFrame(() => { this.update() })
  }
  update() {
    const now = Date.now()
    const elapsed = now - this.state.lastUpdate

    // TODO: update game objects, render game
    this.state.gameboard.update(elapsed);

    this.state.gameboard.draw(this.canvas.getContext('2d'))

    this.setState({ lastUpdate: now })
    requestAnimationFrame(() => {this.update()})
  }
  handleClick(e: React.MouseEvent<HTMLElement>) {
    //console.log(e)
    let boundingBox = this.canvas.getBoundingClientRect();
    this.state.gameboard.handleClick({ type: e.type, x: e.clientX - boundingBox.left, y: e.clientY - boundingBox.top})
  }
  handleKeyPress(e: React.KeyboardEvent<HTMLElement>) {
    this.state.gameboard.handleKeyPress(e.key);
  }
  render() {
        return (
          <canvas id="gameboard" 
            width={ this.state.screen.width * this.state.screen.ratio } 
            height={ this.state.screen.height * this.state.screen.ratio } 
            tabIndex={0}
            onKeyPress={this.handleKeyPress.bind(this)}
            onClick={this.handleClick.bind(this)}
          />
        )
    }
}
