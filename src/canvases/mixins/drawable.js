import buildEvent from '../../utils/buildEvent.js';
import Cursor from '../../classes/Cursor.js';
import Point from '../../classes/Point.js';
import CustomCanvas from '../customCanvas.js';
import TileableCanvasMixin, {
  Tileable,
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
} from './tileable.js';

const _onMouseEnterHandler = Symbol('_onMouseEnterHandler');
const _onMouseLeaveHandler = Symbol('_onMouseLeaveHandler');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

const CLASS_NAME = Symbol.for('DrawableCanvas');

const DRAW_STATE_ENAM = {
  ERASE: 0,
  DRAW: 1,
};

const DrawableCanvasMixin = (BaseClass = CustomCanvas) => {
  if (!(BaseClass === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  }
  if (!(Array.isArray(BaseClass._metaClassNames) && BaseClass._metaClassNames.includes(Symbol.for('TileableCanvas')))) {
    BaseClass = TileableCanvasMixin(BaseClass);
  }

  class DrawableCanvas extends BaseClass {
    _drawState = false;
    _drawType = DRAW_STATE_ENAM.DRAW;

    _cursor = new Cursor(this._el, { offset: {x: 8, y: 8 } });

    [_onMouseDownHandler](event) {
      if (event.metaKey || event.ctrlKey) return;
      this._startDraw(event);
      this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY));
      this._renderInNextFrame();
    }

    [_onMouseMoveHandler](event) {
      if (this._drawState) {
        this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY));
        this._renderInNextFrame();
      }
    }

    [_onMouseUpHandler]() {
      this._drawState = false;
      this._el.removeEventListener('mousemove', this[_onMouseMoveHandler]);
    }

    [_onContextMenuHandler](event) {
      if (!event.metaKey) event.preventDefault();
    }

    _startDraw(event) {
      if (this.tiles == null) return;

      this._drawState = true;
      if (event.button === 0) this._drawType = DRAW_STATE_ENAM.DRAW;
      if (event.button === 2) this._drawType = DRAW_STATE_ENAM.ERASE;
      this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
    }

    _updateTilePlace(x, y, z = ZERO_LAYER) {
      if (this.tiles == null) return;
  
      if (this._drawType === DRAW_STATE_ENAM.ERASE) this._updateTileByCoord(x, y, z, null);
      else if (this._drawType === DRAW_STATE_ENAM.DRAW) {
        for (const [place, tile] of this.tiles.entries()) {
          const [_y, _x] = Point.fromString(place).toArray();
          this._updateTileByCoord(x + _x, y + _y, z, tile);
        }
      }
    }
  
    async _initListeners() {
      await super._initListeners();
  
      this._el.addEventListener('contextmenu', this[_onContextMenuHandler]);
      this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    constructor(options = {}) {
      super(options);

      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
    }

    async updateCurrentTiles(tiles) {
      super.updateCurrentTiles(tiles);
      
      await this._cursor.updateImageFromBitmap(tiles);
      this._cursor.showCursor();
    }
  
    async save() {
      const json = {
        tileHash: {},
        tileMapSize: {
          width: this.width,
          height: this.height,
        },
      };
    
      for (const [key, tile] of this._layers[ZERO_LAYER].entries()) {
        json.tileHash[key] = tile.meta;
      }
    
      return { meta: json };
    }

    async load({ meta: tilesMeta, img }) {
      const promises = [];
      for (const [key, tileMeta] of Object.entries(tilesMeta)) {
        const sx = tileMeta.sourceCoords.x * this._tileSize.x;
        const sy = tileMeta.sourceCoords.y * this._tileSize.y;
        
        promises.push(
          createImageBitmap(img, sx, sy, this._tileSize.x, this._tileSize.y)
            .then((tile) => this._layers[ZERO_LAYER].set(key, {
              ...tileMeta,
              bitmap: tile,
            })),
        );
      }
      await Promise.all(promises);
    }
  }

  DrawableCanvas._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return DrawableCanvas;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin();
