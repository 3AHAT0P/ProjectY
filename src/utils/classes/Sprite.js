export default class Sprite {
  constructor(src) {
    if (typeof src === 'string') this.src = src;
    else throw new TypeError('Sprite source link should be a string');
  }
  
  async load() {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = this.src;
    });
    this._image = image;
    
    return this;
  }
  
  get width() {
    return this._image.width;
  }
  
  get height() {
    return this._image.height;
  }
  
  get currentSprite() {
    return this._image;
  }
}