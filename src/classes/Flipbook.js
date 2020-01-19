import Sprite from './Sprite';
/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
export default class Flipbook {
  options = {
    frameDuration: 300,
  };
  _spriteUrls = [];
  _sprites = [];
  _currentSprite = null;
  _currentSpriteIndex = 0;
  _timer = null;
  
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
    if (sprites == null || sprites.length < 1) throw new Error('Sprites are required!');
    if (options && options.frameDuration) this.options = options;
    this._spriteUrls = sprites;
  }
  
  async init() {
    for (const url of this._spriteUrls) this._sprites.push(new Sprite(url));
    await this.load();
    this._currentSprite = this._sprites[0];
  }
  
  async load() {
    try {
      await Promise.all(this._sprites.map((sprite) => sprite.load()));
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }
  
  get currentSprite() {
    return this._currentSprite;
  }
  
  start() {
    this._timer = setInterval(() => {
      this._currentSprite = this._sprites[this._currentSpriteIndex];
      const nextSpriteIndex = this._currentSpriteIndex + 1;
      
      if (nextSpriteIndex > this._sprites.length) this._currentSpriteIndex = 0;
      else this._currentSpriteIndex = nextSpriteIndex;
    }, this.options.frameDuration)
  }
  
  stop() {
    clearInterval(this._timer);
    this._currentSpriteIndex = 0;
    this._currentSprite = this._sprites[this._currentSpriteIndex];
  }
  
  get width() {
    return this._currentSprite.width;
  }
  
  get height() {
    return this._currentSprite.height;
  }
}
