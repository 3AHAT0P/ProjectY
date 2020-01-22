import Sprite from './Sprite.js';
/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
export default class Flipbook {
  options = {
    frameDuration: 100,
    mirror: false,
  };
  _spriteUrls = [];
  _sprites = [];
  _currentSprite = null;
  _currentSpriteIndex = 0;
  _timer = null;

  /**
   * @constructs The main method to create Flipbook.
   * @param {string[]} sprites - array of image links
   * @param {Object} [options] - meta info for Flippbok
   * @param {number} [options.frameDuration=300] - duration between frames
   * @param {boolean} [options.mirror=false] - if true all sprites would be mirrored
   * @returns {Promise<Flipbook>}
   */
  static async create(sprites, options) {
    const instance = new this(sprites, options);
    await instance.init();
    return instance;
  }
  
  constructor(sprites, options = {}) {
    if (sprites == null || sprites.length < 1) throw new Error('Sprites are required!');
    if (options.frameDuration) this.options.frameDuration = options.frameDuration;
    if (options.mirror) this.options.mirror = options.mirror;
    this._spriteUrls = sprites;
  }
  
  async init() {
    for (const url of this._spriteUrls) this._sprites.push(new Sprite(url));
    await this.load();
    this._currentSprite = this._sprites[0];
    this._createOffscreenCanvas();
  }
  
  async load() {
    try {
      await Promise.all(this._sprites.map((sprite) => sprite.load()));
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }
  
  get currentSprite() {
    return this._offscreenCanvas;
  }

  start() {
    this._updateSize();
    this._render();
    if (this._sprites.length > 1) {
      this._timer = setInterval(() => {
        this._currentSprite = this._sprites[this._currentSpriteIndex];
        this._updateSize();
        this._render();
        const nextSpriteIndex = this._currentSpriteIndex + 1;
    
        if (nextSpriteIndex >= this._sprites.length) this._currentSpriteIndex = 0;
        else this._currentSpriteIndex = nextSpriteIndex;
      }, this.options.frameDuration);
    }
  }
  
  stop() {
    clearInterval(this._timer);
    this._currentSpriteIndex = 0;
    this._currentSprite = this._sprites[this._currentSpriteIndex];
  }
  
  get width() {
    return this._offscreenCanvas.width;
  }
  
  get height() {
    return this._offscreenCanvas.height;
  }
  
  _createOffscreenCanvas() {
    this._offscreenCanvas = document.createElement('canvas');
    this._updateSize();
    this._renderer = this._offscreenCanvas.getContext('2d');
    this._renderer.imageSmoothingEnabled = false;
  }
  
  _updateSize() {
    this._offscreenCanvas.width = this._currentSprite.width;
    this._offscreenCanvas.height = this._currentSprite.height;
  }
  
  _render() {
    const isMirror = this.options.mirror;
    this._renderer.clearRect(0, 0, this.width, this.height);
    if (isMirror) this._renderer.scale(-1, 1);
    this._renderer.drawImage(
      this._currentSprite.currentSprite,
      0,
      0,
      this._currentSprite.width,
      this._currentSprite.height,
      0,
      0,
      this.width * (isMirror ? -1 : 1),
      this.height,
    );
    // if (isMirror) this._renderer.setTransform(1, 0, 0, 1, 0, 0);
  }
}
