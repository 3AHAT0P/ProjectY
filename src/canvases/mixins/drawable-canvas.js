import buildEvent from '/src/utils/build-event.js';
import Cursor from '/src/utils/cursor.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';
import TileableCanvasMixin, { TileableCanvas } from '/src/canvases/mixins/tileable-canvas.js';

const _onMouseEnterHandler = Symbol('_onMouseEnterHandler');
const _onMouseLeaveHandler = Symbol('_onMouseLeaveHandler');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');
const _onClickHandler = Symbol('_onClickHandler');

const CLASS_NAME = Symbol.for('DrawableCanvas');

const DrawableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  if (!(Array.isArray(BaseClass._metaClassNames) && BaseClass._metaClassNames.includes(Symbol.for('TileableCanvas')))) BaseClass = TileableCanvasMixin(BaseClass);

  class DrawableCanvas extends BaseClass {
    _drawState = false;
    _drawType = 1; // 0 - erase, 1 - draw

    _cursor = new Cursor(this._el, { offset: {x: 8, y: 8 } });

    [_onMouseDownHandler](event) {
      this._startDraw();
    }

    [_onMouseMoveHandler](event) {
      if (this._drawState) {
        this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.layerX, event.layerY));
        this._renderInNextFrame();
      }
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

    _updateTilePlace(x, y, z = '0') {
      if (this.tile == null) return;

      if (this._drawType === 1) {
        this._updateTileByCoord(x, y, z, this.tile);
      } else {
        this._updateTileByCoord(x, y, z, null);
      }
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
      
      for (const [key, tile] of this._layers['0'].entries()) {
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
          .then((tile) => this._layers['0'].set(key, tile)));
      }
      await Promise.all(promises);
    }
  }

  DrawableCanvas._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return DrawableCanvas;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin();