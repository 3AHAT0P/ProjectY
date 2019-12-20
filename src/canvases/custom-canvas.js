import buildEvent from '/src/utils/build-event.js';

/* 
  
  const customCanvas = await CustomCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  customCanvas.addEventListener('render', (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); });
 */
export default class CustomCanvas extends EventTarget {
  static async create(...args) {
    const instance = new this(...args);
    await instance.init();
    return instance;
  }

  _el = document.createElement('canvas');
  _ctx = this._el.getContext('2d');

  _imageSmoothingEnabled = false;

  el = null;

  get height() { return this._el.height; }
  get width() { return this._el.width; }

  _renderInNextFrame() {
    requestAnimationFrame(this._render);
  }

  _render() {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }

  constructor(options = {}) {
    super();

    this._el.width = options.size.width;
    this._el.height = options.size.height;
    this.el = options.el;

    this._render = this._render.bind(this);
    this._renderInNextFrame = this._renderInNextFrame.bind(this);
  }

  async init() {
    this._el.style['image-rendering'] = 'pixelated';
    this.el.append(this._el);

    await this._initListeners();

    this._renderInNextFrame()
  }

  async _initListeners() {
    this.addEventListener(':renderRequest', this._renderInNextFrame, { passive: true });
  }

  clear(color = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
