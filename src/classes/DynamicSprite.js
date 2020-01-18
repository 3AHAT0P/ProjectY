/**
 * Dynamic Sprite is used to animate multiple images (like GIFs)
 */
export default class DynamicSprite {
  meta = {
    frameDuration: 300,
  };
  
  constructor(sprites, meta) {
    if (sprites == null) throw new Error('Sprites is required!');
    if (sprites instanceof Array) {
      this.frames = sprites;
      this.meta = meta || this.meta;
    }
  }
}
