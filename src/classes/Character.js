/**
 * ex. await new Character();
 * ex. new Character().then(character => { // some logic })
 */
import DynamicSprite from './DynamicSprite';

export default class Character {
  moveSettings = {
    moveSprite: null,
    moveRightCode: 'ArrowRight',
    moveLeftCode: 'ArrowLeft',
    alternativeMoveRightCode: 'KeyD',
    alternativeMoveLeftCode: 'KeyA',
  };

  jumpSettings = {
    jumpSprite: null,
    jumpCode: 'ArrowUp',
    alternativeJumpCode: 'KeyW',
  };

  attackSettings = {
    attackSprite: null,
    attackCode: 'Space',
  };

  position = {
    x: null,
    y: null,
  };
  
  constructor({
    mainSprite,
    moveSettings: {
      moveSprite,
      moveSpriteMeta,
      moveRightCode,
      moveLeftCode,
      alternativeMoveRightCode,
      alternativeMoveLeftCode,
    },
    jumpSettings: {
      jumpSprite,
      jumpSpriteMeta,
      jumpCode,
      alternativeJumpCode,
    },
    attackSettings: {
      attackSprite,
      attackSpriteMeta,
      attackCode,
    },
  }) {
    if (mainSprite == null) throw new Error('mainSprite is required!');
    // move codes override
    if (moveRightCode) this.moveSettings.moveRightCode = moveRightCode;
    if (moveLeftCode) this.moveSettings.moveLeftCode = moveLeftCode;
    if (alternativeMoveRightCode) this.moveSettings.alternativeMoveRightCode = alternativeMoveRightCode;
    if (alternativeMoveLeftCode) this.moveSettings.alternativeMoveLeftCode = alternativeMoveLeftCode;
    // jump codes override
    if (jumpCode) this.jumpSettings.jumpCode = jumpCode;
    if (alternativeJumpCode) this.jumpSettings.alternativeJumpCode = alternativeJumpCode;
    // attack code override
    if (attackCode) this.attackSettings.attackCode = attackCode;
    
    return (async () => {
      if (typeof mainSprite === 'string') this.mainSprite = await this._loadImage(mainSprite);
      if (moveSprite instanceof Object) this.moveSettings.moveSprite = await this._loadDynamicSprite(moveSprite, moveSpriteMeta);
      if (jumpSprite instanceof Object) this.jumpSettings.jumpSprite = await this._loadDynamicSprite(jumpSprite, jumpSpriteMeta);
      if (attackSprite instanceof Object) this.attackSettings.attackSprite = await this._loadDynamicSprite(attackSprite, attackSpriteMeta);
      
      this._offscreenCanvas = new OffscreenCanvas(this.mainSprite.width, this.mainSprite.height);
      
      return this;
    })();
  }
  
  move() {}
  moveRight() {}
  moveLeft() {}
  jump() {}
  stop() {}
  attack() {}
  
  async _loadImage(src) {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = src;
    });
    
    return image;
  }
  
  async _loadDynamicSprite(sprites, meta) {
    if (sprites instanceof Array && sprites.length > 1) {
      const promises = sprites.map(async ({ src }) => await this._loadImage(src));
      await Promise.all(promises);
      
      return new DynamicSprite(promises, meta);
    }
    else throw new Error('Sprites for dynamic motion should be an array of images')
  }
}
