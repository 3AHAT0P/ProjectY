import buildEvent from '../utils/build-event.js';
import throttle from '../utils/throttle.js';

/* 
  
  const customCanvas = await CustomCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  customCanvas.addEventListener('render', (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); });
 */
export default class Canvas extends EventTarget {
  static _metaClassNames = [];
  
  static async create(...args) {
    const instance = new this(...args);
    await instance.init();
    return instance;
  }
  
  _el = null;
  _ctx = null;
  
  _imageSmoothingEnabled = false;
  
  el = null;
  
  get height() { return this._el.height; }
  get width() { return this._el.width; }
  
  _renderInNextFrame() {
    requestAnimationFrame(this._render);
  }
  
  _render(...args) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }
  
  constructor(options= {}) {
    super();
    
    this._el = options.el;
    this._el.width = options.size.width;
    this._el.height = options.size.height;
    this._ctx = this._el.getContext('2d');
    
    this._render = throttle(this._render.bind(this), 16);
    this._renderInNextFrame = this._renderInNextFrame.bind(this);
  }
  
  async init() {
    Reflect.set(this._el.style, 'image-rendering', 'pixelated');
    
    await this._initListeners();
    
    this._renderInNextFrame();
  }
  
  async _initListeners() {
    this.addEventListener(':renderRequest', this._renderInNextFrame, { passive: true });
  }
  
  updateSize(width, height) {
    this._el.width = width;
    this._el.height = height;
  }
  
  clear(color = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
