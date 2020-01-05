let spritesheetURL = "https://opengameart.org/sites/default/files/crystals3216all.png";

interface SpriteOptions {
  url: string,
  colCount: number,
  rowCount: number,
  spriteWidth: number,
  spriteHeight: number
}

export default class Sprite {
  spritesheet: HTMLImageElement
  isLoaded = false
  static get rowCount() {
    return 'This property can only be read.';
  }
  constructor(public options: SpriteOptions) {
    this.spritesheet = new Image();
    this.spritesheet.src = options.url;
    this.spritesheet.onload = (e) => { this.isLoaded = true; }
  }
  draw(context: CanvasRenderingContext2D, row: number, col: number) {
    // exit if the sprites aren't loaded yet
    if (this.isLoaded) {
      let w = this.options.spriteWidth,
          h = this.options.spriteHeight;

      context.drawImage(this.spritesheet, col*w, row*h, w, h, 0, 0, w, h)
    }
  }  
}