import buildEvent from '/src/utils/build-event.js';
import Cursor from '/src/utils/cursor.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';

const _onMouseEnterHandler = Symbol('_onMouseEnterHandler');
const _onMouseLeaveHandler = Symbol('_onMouseLeaveHandler');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');
const _onClickHandler = Symbol('_onClickHandler');

const TileableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) throw new Error('BaseClass isn\'t prototype of CustomCanvas!');

  class TileableCanvas extends BaseClass {
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

    _cursor = new Cursor(this._el, { offset: {x: 8, y: 8 } });

    get tile() { return this._tile; }
    set tile(tile) { throw new Error('It\'s property read only!'); }

    [_onMouseDownHandler](event) {
      this._startDraw();
    }

    [_onMouseMoveHandler](event) {
      this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
      this._renderInNextFrame();
    }

    [_onMouseUpHandler]() {
      this._drawState = false;
      this._el.removeEventListener('mousemove', this[_onMouseMoveHandler]);
    }

    [_onClickHandler](event) {
      this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
      this._renderInNextFrame();
    }

    _startDraw() {
      if (this.tile == null) return;

      this._drawState = true;
      if (event.button === 0) this._drawType = 1;
      if (event.button === 2) this._drawType = 0;
      this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
    }

    _updateTilePlace(x, y) {
      if (this.tile == null) return;

      if (this._drawType === 1) {
        if (this._drawedTiles.get(`${y}|${x}`) === this.tile) return;
        this._drawedTiles.set(`${y}|${x}`, this.tile);
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

    _render(time, clearRender = false) {
      this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
      this.clear();
      this._drawTiles();
      this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
      if (!clearRender) this._drawGrid();
    }

    _calcGrid() {
      this._columnsNumber = Math.trunc(this.width / this._tileSize.x);
      this._rowsNumber = Math.trunc(this.height / this._tileSize.y);
    }

    _transformEventCoordsToGridCoords(eventX, eventY) {
      return [Math.trunc(eventX / this._tileSize.x), Math.trunc(eventY / this._tileSize.y)];
    }
  
    async _initListeners() {
      await super._initListeners();
  
      this._el.addEventListener('click', this[_onClickHandler], { passive: true });
      this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    constructor(options = {}) {
      super(options);

      this[_onClickHandler] = this[_onClickHandler].bind(this);
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);

      if (options.tileSize != null && options.tileSize.x != null) this._tileSize.x = options.tileSize.x;
      if (options.tileSize != null && options.tileSize.y != null) this._tileSize.y = options.tileSize.y;
    }

    async init() {
      this._calcGrid();
      await super.init();
    }

    async updateCurrentTile(tile) {
      this._tile = tile;
      await this._cursor.updateImageFromBitmap(tile);
      this._cursor.showCursor();
    }

    async save() {
      const a = document.createElement("a");
      a.style = "display: none";
      document.body.appendChild(a);
      
      this._render(null, true);

      const img = await new Promise((resolve) => this._el.toBlob(resolve, 'image/png'));
      a.href = URL.createObjectURL(img);
      a.download = 'tilemap.png';
      a.click();
      URL.revokeObjectURL(a.href);
      
      this._render();

      const json = {};
      
      for (const [key, tile] of this._drawedTiles.entries()) {
        json[key] = { };
      }
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      a.href = URL.createObjectURL(blob);
      a.download = 'tilemap.json';
      a.click();
      URL.revokeObjectURL(a.href);

      a.remove();
    }

    async load({ meta: tilesMeta, img }) {
      const promises = [];
      for (const [key, tileMeta] of Object.entries(tilesMeta)) {
        const [y, x] = key.split('|');
        promises.push(createImageBitmap(img, Number(x) *  this._tileSize.x, Number(y) *  this._tileSize.y, this._tileSize.x, this._tileSize.y)
          .then((tile) => this._drawedTiles.set(key, tile)));
      }
      await Promise.all(promises);
    }
  }

  return TileableCanvas;
};

export default TileableCanvasMixin;

export const TileableCanvas = TileableCanvasMixin();