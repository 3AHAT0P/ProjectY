import Flipbook from './Flipbook';
import Sprite from './Sprite';

const ERROR_HELP_TEXT = 'Use Character.create method to create character with a set of sprites';

export default class Character {
  _coreElement = null;
  _actionHandlerHash = {
    [this.moveSettings.moveLeftCode]: this.moveLeft.bind(this),
    [this.moveSettings.alternativeMoveLeftCode]: this.moveLeft.bind(this),
    [this.moveSettings.moveRightCode]: this.moveRight.bind(this),
    [this.moveSettings.alternativeMoveRightCode]: this.moveRight.bind(this),
    [this.jumpSettings.jumpCode]: this.jump.bind(this),
    [this.jumpSettings.alternativeJumpCode]: this.jump.bind(this),
    [this.attackSettings.attackCode]: this.attack.bind(this),
  };
  _prevActionType = 'STOP';
  _currentActionType = 'STOP';
  _direction = 'RIGHT';
  _hooks = {
    onStop: null,
    onMove: null,
  };
  
  flipbook = null;
  mainSettings = {
    mainFlipbook: null,
    /**
     * The function should return a boolean value which indicates can a Character move or not.
     *
     * @callback checkPosition
     * @returns {boolean}
     */
    checkPosition: null,
    speed: null,
  };
  
  moveSettings = {
    moveRightFlipbook: null,
    moveLeftFlipbook: null,
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
    x: 0,
    y: 0,
  };
  
  /**
   * @constructs The main method to create a character
   * @param {HTMLCanvasElement} coreElement - canvas on which Character will be rendered
   * @param {Object} position - initial Character position
   * @param {number} position.x - canvas coordinates
   * @param {number} position.y - canvas coordinates
   * @param {Object} mainSettings - main Character settings
   * @param {string | string[]} mainSettings.mainFlipbook - url or array of url
   * @param {checkPosition} mainSettings.checkPosition - function to check any collisions and possibility to move.
   * @param {number} mainSettings.speed - speed of a Character in px per second
   * @param {Object} moveSettings - settings for move action
   * @param {string[]} moveSettings.moveFlipbook - array of url
   * @param {string} moveSettings.moveRightCode - main right move action code
   * @param {string} moveSettings.moveLeftCode - main left move action code
   * @param {string} moveSettings.alternativeMoveRightCode - alternative right move action code
   * @param {string} moveSettings.alternativeMoveLeftCode - alternative left move action code
   * @param {Object} jumpSettings - settings for jump action
   * @param {string[]} jumpSettings.jumpFlipbook - array of url
   * @param {string} jumpSettings.jumpCode - main jump action code
   * @param {string} jumpSettings.alternativeJumpCode - alternative jump action code
   * @param {Object} attackSettings - settings for attack actions
   * @param {string[]} attackSettings.attackFlipbook - array of url
   * @param {string} attackSettings.attackCode - main attack action code
   * @returns {Promise<Character>}
   */
  static async create({
    coreElement,
    position,
    mainSettings,
    moveSettings = {},
    jumpSettings = {},
    attackSettings = {},
  }) {
    const { moveFlipbook, moveFlipbookMeta } = moveSettings;
    const { jumpFlipbook, jumpFlipbookMeta } = jumpSettings;
    const { attackFlipbook, attackFlipbookMeta } = attackSettings;
    
    const characterSettings = {
      coreElement,
      position,
      mainSettings,
      moveSettings: { ...moveSettings },
      jumpSettings: { ...jumpSettings },
      attackSettings: { ...attackSettings },
    };
    if (typeof mainSettings.mainFlipbook === 'string') characterSettings.mainSettings.mainFlipbook = await new Sprite(mainSettings.mainFlipbook).load();
    else if (mainSettings.mainFlipbook instanceof Array) characterSettings.mainSettings.mainFlipbook = await Flipbook.create(mainSettings.mainFlipbook);
    if (moveFlipbook instanceof Array) {
      characterSettings.moveSettings.moveRightFlipbook = await Flipbook.create(moveFlipbook, moveFlipbookMeta);
      characterSettings.moveSettings.moveLeftFlipbook = await Flipbook.create(moveFlipbook, {
        ...moveFlipbookMeta,
        mirror: true,
      });
    }
    if (jumpFlipbook instanceof Array) {
      characterSettings.jumpSettings.jumpRightFlipbook = await Flipbook.create(jumpFlipbook, jumpFlipbookMeta);
      characterSettings.jumpSettings.jumpLeftFlipbook = await Flipbook.create(jumpFlipbook, {
        ...jumpFlipbookMeta,
        mirror: true,
      });
    }
    if (attackFlipbook instanceof Array) {
      characterSettings.attackSettings.attackRightFlipbook = await Flipbook.create(attackFlipbook, attackFlipbookMeta);
      characterSettings.attackSettings.attackLeftFlipbook = await Flipbook.create(attackFlipbook, {
        ...attackFlipbookMeta,
        mirror: true,
      });
    }
  
    return new Character(characterSettings);
  }
  
  /**
   * @param {HTMLCanvasElement} coreElement - canvas on which Character will be rendered
   * @param {Object} position - initial Character position
   * @param {number} position.x - canvas coordinates
   * @param {number} position.y - canvas coordinates
   * @param {Object} mainSettings - main Character settings
   * @param {Sprite | Flipbook} mainSettings.mainFlipbook - Sprite or Flipbook instance
   * @param {checkPosition} mainSettings.checkPosition - function to check any collisions and possibility to move.
   * @param {number} mainSettings.speed - speed of a Character in px per second
   * @param {Object} moveSettings - settings for move action
   * @param {Flipbook} moveSettings.moveRightFlipbook
   * @param {Flipbook} moveSettings.moveLeftFlipbook
   * @param {string} moveSettings.moveRightCode - main right move action code
   * @param {string} moveSettings.moveLeftCode - main left move action code
   * @param {string} moveSettings.alternativeMoveRightCode - alternative right move action code
   * @param {string} moveSettings.alternativeMoveLeftCode - alternative left move action code
   * @param {Object} jumpSettings - settings for jump action
   * @param {Flipbook} jumpSettings.jumpRightFlipbook
   * @param {Flipbook} jumpSettings.jumpLeftFlipbook
   * @param {string} jumpSettings.jumpCode - main jump action code
   * @param {string} jumpSettings.alternativeJumpCode - alternative jump action code
   * @param {Object} attackSettings - settings for attack actions
   * @param {Flipbook} attackSettings.attackRightFlipbook
   * @param {Flipbook} attackSettings.attackLeftFlipbook
   * @param {string} attackSettings.attackCode - main attack action code
   * @returns {Character}
   */
  constructor({
    coreElement,
    position,
    mainSettings,
    moveSettings: {
      moveRightFlipbook,
      moveLeftFlipbook,
      moveRightCode,
      moveLeftCode,
      alternativeMoveRightCode,
      alternativeMoveLeftCode,
    } = {},
    jumpSettings: {
      jumpRightFlipbook,
      jumpLeftFlipbook,
      jumpCode,
      alternativeJumpCode,
    } = {},
    attackSettings: {
      attackRightFlipbook,
      attackLeftFlipbook,
      attackCode,
    } = {},
  }) {
    if (coreElement) this._coreElement = coreElement;
    else throw new Error('coreElement is required for Character!');

    this._validateFlipbooks(mainSettings.mainFlipbook, moveRightFlipbook, jumpRightFlipbook, attackRightFlipbook);

    this.mainSettings = mainSettings;
    this.moveSettings.moveRightFlipbook = moveRightFlipbook;
    this.moveSettings.moveLeftFlipbook = moveLeftFlipbook;
    this.jumpSettings.jumpRightFlipbook = jumpRightFlipbook;
    this.jumpSettings.jumpLeftFlipbook = jumpLeftFlipbook;
    this.attackSettings.attackRightFlipbook = attackRightFlipbook;
    this.attackSettings.attackLeftFlipbook = attackLeftFlipbook;
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
  
    // initial position overrides
    if (typeof position.x === 'number') this.position.x = position.x;
    if (typeof position.y === 'number') this.position.y = position.y;
    
    this._createOffscreenCanvas();
    this._initListeners();
    this._setOnChangeJumpFrame();
  }
  
  get currentActionType() {
    return this._currentActionType;
  }
  
  set currentActionType(actionName) {
    if (this._currentActionType === actionName) return;
    if (this._prevActionType !== this.currentActionType) this._prevActionType = this._currentActionType;
    if (actionName === 'STOP') {
      if (this._hooks.onStop instanceof Function) this._hooks.onStop();
    }
    this._currentActionType = actionName;
  }
  
  moveRight() {
    this.currentActionType = 'MOVE';
    this._direction = 'RIGHT';
    this.flipbook = this.moveSettings.moveRightFlipbook;
    this.moveSettings.moveRightFlipbook.start();
  }
  moveLeft() {
    this.currentActionType = 'MOVE';
    this._direction = 'LEFT';
    this.flipbook = this.moveSettings.moveLeftFlipbook;
    this.moveSettings.moveLeftFlipbook.start();
  }
  jump() {
    if (this.currentActionType === 'JUMP') return;
    this.currentActionType = 'JUMP';
    this.flipbook = this.jumpSettings.jumpFlipbook;
    this.jumpSettings.jumpFlipbook.start();
  }
  stop() {
    this.currentActionType = 'STOP';
    this.moveSettings.moveFlipbook.stop();
    this.jumpSettings.jumpFlipbook.stop();
    this.attackSettings.attackFlipbook.stop();
    this.flipbook = this.mainSettings.mainFlipbook;
    if (this.mainSettings.mainFlipbook instanceof Flipbook) this.mainSettings.mainFlipbook.start();
  }
  attack() {
    this.currentActionType = 'ATTACK';
    this.flipbook = this.attackSettings.attackFlipbook;
    this.attackSettings.attackFlipbook.start();
  }
  
  /**
   * The main method for rendering a Character. Return current frame of a Character.
   * You can call it any time you want to rerender your scene.
   * Frame will change based on Flipbook settings which you have passed as a argument.
   * @returns {Image | HTMLCanvasElement}
   */
  render() {
    const offset = this._getOffset();
    if (this.currentActionType === 'RUN') {
      if (this._direction === 'RIGHT') {
        this._changePosition(offset);
      }
      if (this._direction === 'LEFT') {
        this._changePosition(-offset);
      }
    } else if (this.currentActionType === 'JUMP') {
      if (this._prevActionType === 'RUN') {
        if (this._direction === 'RIGHT') this._changePosition(offset);
        if (this._direction === 'LEFT') this._changePosition(-offset);
      }
    }
    this._lastRenderTime = Date.now();
    return this.flipbook.currentSprite;
  }
  
  /**
   * You have to call destroy method if a Character will disappear to prevent memory leaks
   */
  destroy() {
    this._coreElement.removeEventListener('keydown', this._keydownEventHandler);
    this._coreElement.removeEventListener('keyup', this._keyupEventHandler);
  }
  
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

  _createOffscreenCanvas() {
    this._offscreenCanvas = document.createElement('canvas');
    this._offscreenCanvas.width = this.mainSettings.mainFlipbook.width;
    this._offscreenCanvas.height = this.mainSettings.mainFlipbook.height;
    this._renderer = this._offscreenCanvas.getContext('2d');
    this._renderer.imageSmoothingEnabled = false;
  }

  _initListeners() {
    this._coreElement.addEventListener('keydown', this._keydownEventHandler, { passive: true });
    this._coreElement.addEventListener('keyup', this._keyupEventHandler, { passive: true });
  }

  _keydownEventHandler(event) {
    this._actionHandlerHash[event.code](event);
  }

  _keyupEventHandler(event) {
    this.stop();
  }

  get _width() {
    return this.flipbook.currentSprite.width;
  }

  get _height() {
    return this.flipbook.currentSprite.height;
  }

  _changePosition(dx = 0, dy = 0) {
    if (this.mainSettings.checkPosition(this.position.x + dx, this.position.y + dy, this._width, this._height)) {
      this.position.x += dx;
      this.position.y += dy;
      if (this._hooks.onMove instanceof Function) this._hooks.onMove();
    }
  }
  
  _setOnChangeJumpFrame() {
    const onChangeHandler = (frameNumber, frameCount) => {
      if (frameNumber > 0 && frameNumber < 4) this.position.y -= 8;
      if (frameNumber > 4 && frameNumber < 7) this.position.y += 8;
      if (frameNumber === frameCount) {
        this.actionType = this.#prevActionType;
      }
    }
  }
  
  _getOffset() {
    const timeChange = Date.now() - this._lastRenderTime;
    const dt = timeChange / 1000.0;
    return this.mainSettings.speed * dt;
  }
}
