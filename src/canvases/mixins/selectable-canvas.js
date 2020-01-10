import buildEvent from '../../utils/build-event.js';
import CustomCanvas from '../../canvases/custom-canvas.js';

const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');

/* 
  
 */
const SelectableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  
  class SelectableCanvas extends BaseClass {

    _modKey = 'shiftKey';

    _eventDown = null;

    [_onMouseDownHandler](event) {
      if (event[this._modKey]) this._eventDown = event; 
    }

    [_onMouseUpHandler](event) {
      if (event[this._modKey]) {
        const options = {
          ctx: this._ctx,
          eventDown: this._eventDown,
          eventUp: event,
          from: {
            layerX: 0,
            layerY:0
          },
          to: {
            layerX: 0,
            layerY:0
          }
        };
        if (this._eventDown.layerX > event.layerX) {
          options.from.layerX = event.layerX;
          options.to.layerX = this._eventDown.layerX;
        } else {
          options.to.layerX = event.layerX;
          options.from.layerX = this._eventDown.layerX;
        }
        if (this._eventDown.layerY > event.layerY) {
          options.from.layerY = event.layerY;
          options.to.layerY = this._eventDown.layerY;
        } else {
          options.to.layerY = event.layerY;
          options.from.layerY = this._eventDown.layerY;
        }
        this._eventDown = null;
        this.dispatchEvent(buildEvent(':_multiSelect', null, options));
      }
    }

    constructor(options = {}) {
      super(options);

      if (options._modKey != null) this._modKey = options._modKey;
  
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
    }
  
    async _initListeners() {
      await super._initListeners();
  
      this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }
  }

  return SelectableCanvas;
};

export default SelectableCanvasMixin;

export const SelectableCanvas = SelectableCanvasMixin();
