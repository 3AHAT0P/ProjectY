import buildEvent from '/src/utils/build-event.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';

const _onClickHandler = Symbol('_onClickHandler');

/* 
  
 */
const SelectableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  
  class SelectableCanvas extends BaseClass {

    _modKey = 'shiftKey';
  
    [_onClickHandler](event) {
      if (event[this._modKey]) this.dispatchEvent(buildEvent(':_select', null, { ctx: this._ctx, nativeEvent: event }));
    }

    constructor(options = {}) {
      super(options);

      if (options._modKey != null) this._modKey = options._modKey;
  
      this[_onClickHandler] = this[_onClickHandler].bind(this);
    }
  
    async _initListeners() {
      await super._initListeners();
  
      this._el.addEventListener('click', this[_onClickHandler], { passive: true });
    }
  }

  return SelectableCanvas;
};

export default SelectableCanvasMixin;

export const SelectableCanvas = SelectableCanvasMixin();
