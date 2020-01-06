import buildEvent from '/src/utils/build-event.js';
import Cursor from '/src/utils/cursor.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';

const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseOutHandler = Symbol('_onMouseOutHandler');

const CLASS_NAME = Symbol.for('TileableCanvas');

const TileableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) throw new Error('BaseClass isn\'t prototype of CustomCanvas!');

  class TileableCanvas extends BaseClass {
    _tile = null;
    _tiles = null;
    _hoverTile = null;
    _tileSize = {
      x: 16,
      y: 16,
    };

    _layers = {
      '-1': new Map(),
      '0': new Map(),
      '1': new Map(),
    };

    _columnsNumber = 0;
    _rowsNumber = 0;

    // current
    get tile() { return this._tile; }
    set tile(tile) { throw new Error('It\'s property read only!'); }
    // current
    get tiles() { return this._tiles; }
    set tiles(tiles) { throw new Error('It\'s property read only!'); }

    [_onMouseMoveHandler](event) {
      this._hoverTilePlace(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
      this._renderInNextFrame();
    }

    [_onMouseOutHandler](event) {
      this._hoverTilePlace(-1, -1);
      this._renderInNextFrame();
    }

    _getTile(x, y, z = '0') {
      const layer = this._layers[z];
      return layer.get(`${y}|${x}`);
    }

    _updateTileByCoord(x, y, z = '0', tile) {
      const layer = this._layers[z];

      if (tile != null) {
        if (layer.get(`${y}|${x}`) === tile) return;
        layer.set(`${y}|${x}`, tile);
      } else {
        if (!layer.has(`${y}|${x}`)) return;
        layer.delete(`${y}|${x}`);
      }
      layer.isDirty = true;
    }

    _hoverTilePlace(x, y) {
      for (const [place, tile] of this._layers['1'].entries()) {
        if (tile != null) {
          const [_y, _x] = place.split('|');
          if (x === _x && y === _y) return;
          else this._updateTileByCoord(_x, _y, '1', null);
        } 
      }
      this._updateTileByCoord(x, y, '1', this._hoverTile);
    }

    _drawTiles() {
      this._drawLayer(this._layers['-1']);
      this._drawLayer(this._layers['0']);
      this._drawLayer(this._layers['1']);
    }

    _drawLayer(layer) {
      for (const [place, tile] of layer.entries()) {
        const [y, x] = place.split('|');
        this._ctx.drawImage(tile, Number(x) * this._tileSize.x, Number(y) * this._tileSize.y, this._tileSize.x, this._tileSize.y);
      }

      // @TODO Optimization
      // if (layer.isDirty) {
      //   layer.isDirty = false;
      //   for (const [place, tile] of layer.entries()) {
      //     const [y, x] = place.split('|');
      //     layer.cache.drawImage(tile, Number(x) * this._tileSize.x, Number(y) * this._tileSize.y, this._tileSize.x, this._tileSize.y);
      //   }
      //   this._ctx.drawImage(layer.cache, 0, 0, this._el.width, this._el.height);
      // } else {
      //   // Render cache of the layer
      //   this._ctx.drawImage(layer.cache, 0, 0, this._el.width, this._el.height);
      // }
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

      this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
      this._el.addEventListener('mouseout', this[_onMouseOutHandler], { passive: true });
    }

    async _prepareHoverTileMask() {
      const canvas = document.createElement('canvas');
      canvas.style['image-rendering'] = 'pixelated';
      canvas.width = this._tileSize.x;
      canvas.height = this._tileSize.y;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'hsla(0, 0%, 0%, .1)';
      ctx.fillRect(0, 0, this._tileSize.x, this._tileSize.y);
      this._hoverTile = await createImageBitmap(canvas, 0, 0, this._tileSize.x, this._tileSize.y);
    }

    constructor(options = {}) {
      super(options);

      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseOutHandler] = this[_onMouseOutHandler].bind(this);

      if (options.tileSize != null && options.tileSize.x != null) this._tileSize.x = options.tileSize.x;
      if (options.tileSize != null && options.tileSize.y != null) this._tileSize.y = options.tileSize.y;
    }

    async init() {
      this._calcGrid();

      await this._prepareHoverTileMask();

      await super.init();
    }

    _resize(multiplier) {
      this._tileSize.x *= multiplier;
      this._tileSize.y *= multiplier;
      if (super._resize) super._resize(multiplier);
      // this._calcGrid();
      this._renderInNextFrame();
    }
  }

  TileableCanvas._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return TileableCanvas;
};

export default TileableCanvasMixin;

export const TileableCanvas = TileableCanvasMixin();