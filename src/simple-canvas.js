import buildEvent from '/src/utils/build-event.js';

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

  _render() {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this.dispatchEvent(buildEvent('render', null, { ctx: this._ctx }));
  }

  constructor(options = {}, handlers = {}) {
    super();

    this._el.width = options.size.width;
    this._el.height = options.size.height;
    this.el = options.el;
  }

  async init() {
    this._el.style['image-rendering'] = 'pixelated';
    this.el.append(this._el);

    this.addEventListener('renderRequest', () => this._render(), { passive: true });

    this._render();
  }

  clear(color = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
