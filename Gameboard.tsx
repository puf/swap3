import React from 'react'
import Gem from './Gem'
import Sprite from './Sprite'

interface GameboardProps {
  colCount: number,
  rowCount: number,
  gemSize: number,
  boardPadding: number,
  gemSprites: Sprite
}
class Point {
  constructor() {
    this.row = this.col = -1
  }
  row: number
  col: number
}

export default class Gameboard {
  gems: Gem[][] // gem[row][col]
  gemsSprite: Sprite
  selected: Point = new Point()
  marked: Gem; // reference to marked gem
  time: number = 0
  constructor(public props: GameboardProps) {
    this.gems = []
    for (var row=0; row < props.rowCount; row++) {
      this.gems[row] = []
      for (var col=0; col < props.colCount; col++) {
        this.gems[row][col] = new Gem(props.gemSprites)
      }
    }
  }
  handleClick(e) {
    let props = this.props
    console.log(e)
    // determine what cell was clicked
    var col = Math.floor((e.x - props.boardPadding) / props.gemSize)
    var row = Math.floor((e.y - props.boardPadding) / props.gemSize)
    // TODO: do a hit test on the actual gem?

    // deselect the current cell
    if (this.gems[this.selected.row] && this.gems[this.selected.row][this.selected.col]) {
      this.gems[this.selected.row][this.selected.col].setStatus(Gem.Status.Default)
    }

    // if user clicked same gem as was selected, it should only be deselected, not also reseleced
    if (col !== this.selected.col || row !== this.selected.row) {
      // detect click on cell next to selected cell and swap if that happens
      if (Math.abs(col - this.selected.col) + Math.abs(row - this.selected.row) === 1) {
        let prev = this.gems[this.selected.row][this.selected.col]
        this.gems[this.selected.row][this.selected.col] = this.gems[row][col]
        if (!this.gems[row][col]) debugger
        this.gems[row][col] = prev
        prev.setStatus(Gem.Status.Default)
        row = col = -1 // no gem is selected after a swap
        this.scan() // scan for triplets
      }

      // set the clicked cell as being the selected one
      this.selected.row = row
      this.selected.col = col

      // select the new current cell
      if (this.gems[this.selected.row] && this.gems[this.selected.row][this.selected.col]) {
        if (!this.gems[this.selected.row][this.selected.col]) debugger // should never happen, since we don't delete gems
        this.gems[this.selected.row][this.selected.col].setStatus(Gem.Status.Selected)
      }
    }
    else {
      this.selected.row = -1
      this.selected.col = -1
    }
  }
  handleKeyPress(key: string) {
    if (key === 's') {
        this.scan()
    }
    if (key === 'd') {
      if (this.selected.row !== -1 && this.selected.col !== -1) {
        this.gems[this.selected.row][this.selected.col].color = -1
        this.selected.row = this.selected.col = -1
      }
    }
    if (key == "m") {
      this.marked = this.gems[this.selected.row][this.selected.col];
    }
  }
  /// Calls the callback for each gem
  forEach(callback) {
    for (var row=0; row < this.props.rowCount; row++) {
      for (var col=0; col < this.props.colCount; col++) {
        if (callback(this.gems[row][col], row, col)) {
          break; // go to next row
        }
      }
    }    
  }
  update(elapsedMs: number) {
    for (var row=0; row < this.props.rowCount; row++) {
      for (var col=0; col < this.props.colCount; col++) {
        if (this.gems[row][col]) this.gems[row][col].update(elapsedMs);
      }
    }
  }
  scan() {
    console.log("scan");
    let marked = [];
    let droppedGemCount = 0;
    this.forEach((gem, row, col) => {
      // scan right
      if (col < this.props.colCount - 2) {
        if (gem.isOccupied() && this.gems[row][col+1].color === gem.color && this.gems[row][col+2].color === gem.color) {
          console.log("Found a row starting at "+row+", "+col)
          marked.push({row, col})
          marked.push({row, col: col+1})
          marked.push({row, col: col+2})
        }
      }
      // scan down
      if (row < this.props.rowCount - 2) {
        if (gem.isOccupied() && this.gems[row+1][col].color === gem.color && this.gems[row+2][col].color === gem.color) {
          console.log("Found a col starting at "+row+", "+col)
          marked.push({row, col})
          marked.push({row: row+1, col})
          marked.push({row: row+2, col})
        }
      }
    })
    if (marked.length > 0) {
      // remove marked gems
      console.log("marked", marked)
      marked.forEach((pt) => {
        if (!this.gems[pt.row][pt.col]) debugger // that'd be wrong
        // TODO: explode
        this.gems[pt.row][pt.col].color = -1
      })
    }
      
    // drop remaining gems down
    for (var row=this.props.rowCount-2; row >= 0; row--) {
      for (var col=0; col < this.props.colCount; col++) {
        let gem = this.gems[row][col]
        let down = this.gems[row+1][col]
        //if (this.marked == gem) debugger
        //if (gem.isOccupied() && !down.isOccupied()) {
        if (gem.isOccupied() && gem.status !== Gem.Status.Dropping && down.canBeDroppedInto()) {
          droppedGemCount += 1;
          console.log(this.time+": Dropping from "+row+", "+col)
          gem.setStatus(Gem.Status.Dropping, (gem, cookie) => {
            console.log(this.time+": Drop from "+cookie.row+", "+cookie.col+" completed: gems["+(cookie.row+1)+"]["+cookie.col+"] is now "+cookie.gem.color)
            cookie.down.color = cookie.gem.color
            cookie.gem.color = -1
          }, { row, col, gem, down })
        }
      }
    }
    // fill from the top
    this.forEach((gem, row, col) => {
      if (row === 0 && !gem.isOccupied()) {
        gem.color = gem.randomGemColor()
      }
    })

    // since this has changed the board, scan again
    if (droppedGemCount > 0) {
      setTimeout(() => { this.scan() }, Gem.msToHalfDrop)
      setTimeout(() => { this.scan() }, Gem.msToDrop)
    }
  }
  draw(context: CanvasRenderingContext2D) {
    //context.save();
    this.time++;

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = '#303030'
    context.fillRect(
      this.props.boardPadding, 
      this.props.boardPadding,
      this.props.colCount*this.props.gemSize, 
      this.props.rowCount*this.props.gemSize);

    this.forEach((gem, row, col) => {
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.translate(
        this.props.boardPadding+col*this.props.gemSize, 
        this.props.boardPadding+row*this.props.gemSize
      );
      let isSelected = (row == this.selected.row && col == this.selected.col);
      if (this.gems[row][col].isOccupied()) {
        this.gems[row][col].draw(context, isSelected)
      }

      if (this.marked === gem) {
        context.strokeStyle = 'blue'
        context.strokeRect(0, 0, this.props.gemSize, this.props.gemSize)
      }

    })

    // write debug messages
    let msg = ''
    if (this.marked) {
      msg += this.marked.toString() + '\n'
    }


    context.setTransform(1, 0, 0, 1, 0, 0)
    context.translate(
      2*this.props.boardPadding+this.props.colCount*this.props.gemSize, 
      2*this.props.boardPadding
    );

    context.strokeStyle = 'white'
    context.font = '14px serif'
    context.clearRect(-10, -10, 120, 120)
    let lines = msg.split('\n')
    let offset = 0;
    lines.forEach((line) => {
      context.strokeText(line, 0, offset)
      offset += 15
    })

  }
}
