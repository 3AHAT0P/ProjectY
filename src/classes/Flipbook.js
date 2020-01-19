/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
import Sprite from './Sprite';

export default class Flipbook {
  meta = {
    frameDuration: 300,
  };
  
  /**
   * The main method to create Flipbook.
   * @param {string[]} sprites - array of image links
   * @param {Object} meta - meta info for Flippbok
   * @param {number} meta.frameDuration - duration between frames
   * @returns {Promise<Flipbook>}
   */
  static async create(sprites, meta) {
    if (sprites == null) throw new Error('Sprites are required!');
    
    let flipbookFrames;
    
    if (sprites instanceof Array && sprites.length > 1) {
      flipbookFrames = sprites.map(sprite => new Sprite(sprite).load());
      await Promise.all(flipbookFrames);
    }
    else throw new TypeError('Sprites of Flipbook should be an array of image links');
    
    return new Flipbook(flipbookFrames, meta);
  }
  
  constructor(sprites, meta) {
    if (sprites instanceof Array && sprites.every(sprite => (sprite instanceof Sprite))) {
      this.frames = sprites;
      if (meta && meta.frameDuration) this.meta = meta;
    }
    else throw new Error('Use Flipbook.create method')
  }
}
