import Cursor from '/src/utils/cursor';

export default class ResizeableCanvas {
  static async create(el, size, render, handlers) {
    const instance = new this(el, size, render, handlers);
    await instance.init();
    return instance;
  }

  _el = document.createElement('canvas');
  _ctx = this._el.getContext('2d');

  _sizeMultiplier = 1;
  _imageSmoothingEnabled = false;

  el = null;
  render = null;

  get height() { return this._el.height; }
  get width() { return this._el.width; }
  get sizeMultiplier() { return this._sizeMultiplier; }

  get pointerCursor() {
    if (this.getCursor) return `url('${this.getCursor()}'), pointer`;
    return 'pointer';
  }

  _onMouseMove(event) {
    if (event.shiftKey) this._el.style.cursor = this.pointerCursor;
    else this._el.style.cursor = 'unset';
  }

  _onClickHandler(event) {
    if (event.shiftKey && this.onSelect != null) this.onSelect(event, this);
    else if (event.ctrlKey) this._resize(1 / 2);
    else this._resize(2);
    this._render();
  }

  _resize(multiplier) {
    this._sizeMultiplier *= multiplier;
    this._el.width *= multiplier;
    this._el.height *= multiplier;
  }

  _render() {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.render(this._ctx, this);
  }

  constructor(el, size, render, handlers) {
    this._el.width = size.width;
    this._el.height = size.height;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClickHandler = this._onClickHandler.bind(this);

    this.onSelect = handlers.onSelect;
    this.getCursor = handlers.getCursor;

    this.render = render;
    this.el = el;
  }

  async init() {
    this._el.style['image-rendering'] = 'pixelated';
    this._el.addEventListener('click', this._onClickHandler, { passive: true });
    this._el.addEventListener('mousemove', this._onMouseMove, { passive: true });
    this.el.append(this._el);

    this._cursor = new Cursor(this._el, {offset: { x: 8, y: 8 }, event: 'mousemove' });

    this._render();
  }

  clear(color = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
