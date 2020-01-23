import { TileableCanvas } from '../Сanvas/mixins/tileableCanvas.js';
import SelectableCanvasMixin from '../Сanvas/mixins/selectableCanvas.js';
import ResizeableCanvasMixin from '../Сanvas/mixins/resizeableCanvas.js';
import buildEvent from '../utils/buildEvent.js';
import Tile from '../utils/classes/Tile.js';

export default class TileSet extends SelectableCanvasMixin(ResizeableCanvasMixin(TileableCanvas)) {
  _imageSrcLink = 'content/TileSet/mainTileSet.png';
  _imageSrc = null;

  _metadataSrcLink = 'content/TileSet/main-tile-set.json';
  _metadataSrc = null;

  _onMultiSelect({ from, to }) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map();
    for (let y = yFrom, _y = 0; y <= yTo; ++y, ++_y) {
      for (let x = xFrom, _x = 0; x <= xTo; ++x, ++_x) {
        tiles.set(`${_y}|${_x}`, this._getTile(x, y));
      }
    }
    this.dispatchEvent(buildEvent(':multiSelect', null, { tiles }));
  }

  constructor(options = {}) {
    super(Object.assign({}, options, { size: { width: 0, height: 0 } }));
  
    this._imageSrcLink = options.imageUrl || this._imageSrcLink;
    this._metadataSrcLink = options.metadataUrl || this._metadataSrcLink;
  }

  async init() {
    await this._loadImage();

    await super.init();

    await this._parse();
    // await this._loadMetadata();
    // await this.load({ meta: this._metadataSrc, img: this._imageSrc });

    this._renderInNextFrame();
  }

  async _initListeners() {
    await super._initListeners();
    this.addEventListener(':_multiSelect', this._onMultiSelect, { passive: true });
  }

  async _loadImage() {
    this._imageSrc = new Image();
    await new Promise((resolve, reject) => {
      this._imageSrc.onload = resolve;
      this._imageSrc.onerror = reject;
      this._imageSrc.src = this._imageSrcLink;
    });
    this.updateSize(this._imageSrc.width, this._imageSrc.height);
  }

  async _parse() {
    const source = {
      data: this._imageSrc,
      url: this._imageSrcLink,
      tileSize: { ...this._tileSize },
    };
    const promises = [];
    for (let row = 0; row < this._rowsNumber; row += 1) {
      const y = row * this._tileSize.y;
      for (let col = 0; col < this._columnsNumber; col += 1) {
        const x = col * this._tileSize.x;
        promises.push(
          Tile.fromTileSet(source, { x, y }, { sourceCoords: { x: col, y: row }, size: { ...this._tileSize }})
            .then((tile) => this._updateTileByCoord(col, row, '0', tile)),
        );
      }
    }
    
    await Promise.all(promises);
  }

  //TODO need to check if it needed. We have such method in index.js
  async _loadMetadata() {
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }
}
