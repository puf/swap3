import React from 'react';
import Sprite from './Sprite'


class Gem {
  gemsImg: HTMLImageElement
  frame: number = 0
  elapsed: number = 0
  offset: number = 0
  rotation: number = 0.0
  color: number
  status: Gem.Status
  static msPerFrame = 125 // ms per animation frame for selected gems
  static msToDrop = 500 // ms it takes to completely drop
  static msToHalfDrop = Gem.msToDrop / 2
  private completionCallback: any
  private completionCallbackCookie: any
  constructor(public sprite: Sprite) {
    this.color = this.randomGemColor()
  }
  public randomGemColor() {
    return Math.floor(Math.random() * this.sprite.options.rowCount)
  }
  update(elapsedMs: number) {
    let frameCount = this.sprite.options.colCount
    this.elapsed += elapsedMs

    if (this.status === Gem.Status.Selected) {
      this.frame = Math.floor(this.elapsed / Gem.msPerFrame) % frameCount
    }
    else if (this.status === Gem.Status.Dropping) {
      if (this.elapsed <= Gem.msToDrop) {
        this.offset = Math.floor(this.sprite.options.spriteHeight * this.elapsed / Gem.msToDrop)
      }
      else {
        this.status = Gem.Status.Default
        this.offset = 0
        if (this.completionCallback) {
          this.completionCallback(this,this.completionCallbackCookie)
          this.completionCallback = this.completionCallbackCookie = null
        }
      }
    }
    else if (this.rotation > 0) {
      

    }
    else if (Math.random() < 0.01) {
        this.offset = 0
        this.rotation = 0.1
    }
  }
  public setStatus(status: Gem.Status, callback?: any, callbackCookie?: any) {
    this.status = status
    this.elapsed = 0
    this.frame = 0
    this.completionCallback = callback
    this.completionCallbackCookie = callbackCookie
  }
  public isOccupied(): boolean {
    return this.color !== -1;
  }
  public canBeDroppedInto(): boolean {
    return this.color === -1 || (this.status == Gem.Status.Dropping && this.elapsed >= Gem.msToHalfDrop)
  }
  draw(context: CanvasRenderingContext2D, isSelected: boolean) {
    context.translate(0, this.offset)
    this.sprite.draw(context, this.color, this.frame)
   }
   toString() {
     return `status: ${Gem.Status[this.status]}\ncolor: ${this.color}\nframe: ${this.frame}\noffset: ${this.offset}\nelapsed: ${this.elapsed}`

   }
}

module Gem {
  export enum Status { Default, Selected, Dropping, Exploding }
  MsToDrop: 500
}

export = Gem
