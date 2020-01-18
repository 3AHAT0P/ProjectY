import CustomCanvas from '../customCanvas.js';

const INCREASE_SIZE_MULTIPLIER = 2;
const DECREASE_SIZE_MULTIPLIER = 1 / 2;

const _onClickHandler = Symbol('_onClickHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

/* 
  
 */
const ResizeableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  }
  
  class ResizeableCanvas extends BaseClass {

    _sizeMultiplier = 1;
  
    get sizeMultiplier() { return this._sizeMultiplier; }
  
    [_onClickHandler](event) {
      if (event.ctrlKey) {
        this._resize(INCREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }
  
    [_onContextMenuHandler](event) {
      if (event.ctrlKey) {
        this._resize(DECREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }
  
    _resize(multiplier) {
      this._sizeMultiplier *= multiplier;
      this.updateSize(this._el.width * multiplier, this._el.height * multiplier);
      if (super._resize instanceof Function) super._resize(multiplier);
    }
  
    constructor(options = {}) {
      super(options);
  
      this[_onClickHandler] = this[_onClickHandler].bind(this);
      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
    }
  
    async _initListeners() {
      await super._initListeners();
  
      this._el.addEventListener('click', this[_onClickHandler]);
      this._el.addEventListener('contextmenu', this[_onContextMenuHandler], { capture: true });
    }
  }

  return ResizeableCanvas;
};

export default ResizeableCanvasMixin;

export const Resizeable = ResizeableCanvasMixin();
