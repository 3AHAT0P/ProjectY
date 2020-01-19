import Flipbook from './Flipbook';
import Sprite from './Sprite';

const ERROR_HELP_TEXT = 'Use Character.create method to create character with a set of sprites';

export default class Character {
  mainSettings = {
    mainFlipbook: null,
  };
  
  moveSettings = {
    moveFlipbook: null,
    moveRightCode: 'ArrowRight',
    moveLeftCode: 'ArrowLeft',
    alternativeMoveRightCode: 'KeyD',
    alternativeMoveLeftCode: 'KeyA',
  };

  jumpSettings = {
    jumpFlipbook: null,
    jumpCode: 'ArrowUp',
    alternativeJumpCode: 'KeyW',
  };

  attackSettings = {
    attackFlipbook: null,
    attackCode: 'Space',
  };

  position = {
    x: null,
    y: null,
  };
  
  /**
   * The main method to create a character
   * @param {string | Object} mainFlipbook - sprite or
   * @param moveSettings
   * @param jumpSettings
   * @param attackSettings
   * @returns {Promise<Character>}
   */
  static async create({
    mainFlipbook,
    moveSettings = {},
    jumpSettings = {},
    attackSettings = {},
  }) {
    const { moveFlipbook, moveFlipbookMeta } = moveSettings;
    const { jumpFlipbook, jumpFlipbookMeta } = jumpSettings;
    const { attackFlipbook, attackFlipbookMeta } = attackSettings;
    
    const characterSettings = {
      moveSettings: { ...moveSettings },
      jumpSettings: { ...jumpSettings },
      attackSettings: { ...attackSettings },
    };
    if (typeof mainFlipbook === 'string') characterSettings.mainFlipbook = await new Sprite(mainFlipbook).load();
    if (mainFlipbook instanceof Object) characterSettings.mainFlipbook = await Flipbook.create(mainFlipbook);
    if (moveFlipbook instanceof Object) characterSettings.moveSettings.moveFlipbook = await Flipbook.create(moveFlipbook, moveFlipbookMeta);
    if (jumpFlipbook instanceof Object) characterSettings.jumpSettings.jumpFlipbook = await Flipbook.create(jumpFlipbook, jumpFlipbookMeta);
    if (attackFlipbook instanceof Object) characterSettings.attackSettings.attackFlipbook = await Flipbook.create(attackFlipbook, attackFlipbookMeta);
  
    return new Character(characterSettings);
  }
  
  constructor({
    mainFlipbook,
    moveSettings: {
      moveFlipbook,
      moveRightCode,
      moveLeftCode,
      alternativeMoveRightCode,
      alternativeMoveLeftCode,
    } = {},
    jumpSettings: {
      jumpFlipbook,
      jumpCode,
      alternativeJumpCode,
    } = {},
    attackSettings: {
      attackFlipbook,
      attackCode,
    } = {},
  }) {
    this._validateFlipbooks(mainFlipbook, moveFlipbook, jumpFlipbook, attackFlipbook);

    this.mainSettings.mainFlipbook = mainFlipbook;
    this.moveSettings.moveFlipbook = moveFlipbook;
    this.jumpSettings.jumpFlipbook = jumpFlipbook;
    this.attackSettings.attackFlipbook = attackFlipbook;
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

    this._offscreenCanvas = new OffscreenCanvas(this.mainFlipbook.width, this.mainFlipbook.height);
  }
  
  move() {}
  moveRight() {}
  moveLeft() {}
  jump() {}
  stop() {}
  attack() {}
  
  _validateFlipbooks(mainFlipbook, moveFlipbook, jumpFlipbook, attackFlipbook) {
    const isMainFlipbookValid = mainFlipbook != null && (mainFlipbook instanceof Sprite || mainFlipbook instanceof Flipbook);
    const isMoveFlipbookValid = moveFlipbook != null && moveFlipbook instanceof Flipbook;
    const isJumpFlipbookValid = jumpFlipbook != null && jumpFlipbook instanceof Flipbook;
    const isAttackFlipbookValid = attackFlipbook != null && attackFlipbook instanceof Flipbook;
    
    const invalidFlipbooks = [];
    
    if (!isMainFlipbookValid) invalidFlipbooks.push('mainFlipbook');
    if (!isMoveFlipbookValid) invalidFlipbooks.push('moveFlipbook');
    if (!isJumpFlipbookValid)  invalidFlipbooks.push('jumpFlipbook');
    if (!isAttackFlipbookValid) invalidFlipbooks.push('attackFlipbook');
    
    if (invalidFlipbooks.length) throw new Error(`${invalidFlipbooks} are required! ${ERROR_HELP_TEXT}`)
  }
}
