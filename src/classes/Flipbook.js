import Sprite from './Sprite';
/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
export default class Flipbook {
  meta = {
    frameDuration: 300,
  };
  _spriteUrls = [];
  _sprites = [];
  
  /**
   * The main method to create Flipbook.
   * @param {string[]} sprites - array of image links
   * @param {Object} options - meta info for Flippbok
   * @param {number} options.frameDuration - duration between frames
   * @returns {Promise<Flipbook>}
   */
  static async create(sprites, options) {
    const instance = new this(sprites, options);
    await instance.init();
    return instance;
  }
  
  constructor(sprites, options) {
    if (sprites == null) throw new Error('Sprites are required!');
    if (options && options.frameDuration) this.options = options;
    this._spriteUrls = sprites;
  }
  
  async init() {
    for (const url of this._spriteUrls) this._sprites.push(new Sprite(url));
    await this.load();
  }
  
  async load() {
    try {
      await Promise.all(this._sprites.map((sprite) => sprite.load()));
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }
}
