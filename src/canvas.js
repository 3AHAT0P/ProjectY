export default class Canvas {
  static async create(...args) {
    const instance = new this(...args);
    await instance.init();
    return instance;
  }

  _el = document.createElement('canvas');
  _ctx = this._el.getContext('2d');

  _imageSmoothingEnabled = false;

  _tile = null;
  _tileSize = {
    x: 16,
    y: 16,
  };

  _drawedTiles = new Map();

  _columnsNumber = 0;
  _rowsNumber = 0;

  _drawState = false;
  _drawType = 1; // 0 - erase, 1 - draw

  el = null;

  get height() { return this._el.height; }
  get width() { return this._el.width; }

  get tile() { return this._tile; }
  set tile(tile) { return this._tile = tile; }

  _onMouseDownHandler(event) {
    this._drawState = true;
    if (event.button === 0) this._drawType = 1;
    if (event.button === 2) this._drawType = 0;
    this._el.addEventListener('mousemove', this._onMouseMoveHandler, { passive: true });
  }

  _onMouseMoveHandler(event) {
    this._drawTile(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
    this._render();
  }

  _onMouseUpHandler() {
    this._drawState = false;
    this._el.removeEventListener('mousemove', this._onMouseMoveHandler, { passive: true });
  }

  _onClickHandler(event) {
    // this.clear();
    this._drawTile(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
    this._render();
  }

  _drawTile(x, y) {
    if (this._drawType === 1) {
      if (this._drawedTiles.get(`${y}|${x}`) === this._tile) return;
      this._drawedTiles.set(`${y}|${x}`, this._tile);
    } else {
      if (!this._drawedTiles.has(`${y}|${x}`)) return;
      this._drawedTiles.delete(`${y}|${x}`);
    }
  }

  _drawTiles() {
    for (const [place, tile] of this._drawedTiles.entries()) {
      const [y, x] = place.split('|');
      this._ctx.drawImage(tile, Number(x) * this._tileSize.x, Number(y) * this._tileSize.y);
    }
  }

  _drawGrid() {
    this._ctx.save();
    this._ctx.strokeStyle = 'hsla(0, 100%, 0%, 60%)';
    this._ctx.beginPath();
    this._ctx.setLineDash([4, 2]);
    this._ctx.lineWidth = 1;
    for (let i = 0; i <= this._columnsNumber; ++i) {
      const lineX = i * this._tileSize.x;
      this._ctx.moveTo(lineX, 0);
      this._ctx.lineTo(lineX, this.height);
    }
    for (let i = 0; i <= this._rowsNumber; ++i) {
      const lineY = i * this._tileSize.y;
      this._ctx.moveTo(0, lineY);
      this._ctx.lineTo(this.width, lineY);
    }
    this._ctx.stroke();
    this._ctx.restore();
  }

  _render() {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this._drawTiles();
    this.render(this._ctx, this);
    this._drawGrid();
  }

  _calcGrid() {
    this._columnsNumber = this.width / this._tileSize.x;
    this._rowsNumber = this.height / this._tileSize.y;
  }

  _transformEventCoordsToGridCoords(eventX, eventY) {
    return [Math.trunc(eventX / this._tileSize.x), Math.trunc(eventY / this._tileSize.y)]
  }

  constructor(options = {}, handlers = {}) {
    this._el.width = options.size.width;
    this._el.height = options.size.height;

    this._onClickHandler = this._onClickHandler.bind(this);
    this._onMouseDownHandler = this._onMouseDownHandler.bind(this);
    this._onMouseMoveHandler = this._onMouseMoveHandler.bind(this);
    this._onMouseUpHandler = this._onMouseUpHandler.bind(this);

    if (options.tileSize != null && options.tileSize.width != null) this._tileSize.x = options.tileSize.width;
    if (options.tileSize != null && options.tileSize.height != null) this._tileSize.y = options.tileSize.height;
    if (handlers.render != null) this.render = handlers.render;
    this.el = options.el;
  }

  async init() {
    this._el.style['image-rendering'] = 'pixelated';
    this._el.addEventListener('click', this._onClickHandler, { passive: true });
    this._el.addEventListener('mousedown', this._onMouseDownHandler, { passive: true });
    this._el.addEventListener('mouseup', this._onMouseUpHandler, { passive: true });
    this.el.append(this._el);

    this._calcGrid();

    this._render();
  }

  render(ctx, canvas) {

  }

  clear(color = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
