import { TileableCanvas } from '/src/canvases/mixins/tileable-canvas.js';
import SelectableCanvasMixin from '/src/canvases/mixins/selectable-canvas.js';
import ResizeableCanvasMixin from '/src/canvases/mixins/resizeable-canvas.js';
import buildEvent from '/src/utils/build-event.js';

export default class MineTileMap extends SelectableCanvasMixin(ResizeableCanvasMixin(TileableCanvas)) {

  _imageSrcLink = 'content/tilesets/main-tile-set.png';
  _imageSrc = null;

  _metadataSrcLink = 'content/tilesets/main-tile-set.json';
  _metadataSrc = null;

  _onSelect({ nativeEvent: event }) {
    const [x, y] = this._transformEventCoordsToGridCoords(event.layerX, event.layerY)
    const tile = this._getTile(x, y);
    this.dispatchEvent(buildEvent(':select', null, { tile }));
  }

  constructor(options = {}) {
    options.size = {
      width: 0,
      height: 0,
    };
    super(options);
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
    this.addEventListener(':_select', this._onSelect, { passive: true });
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
    for (let row = 0; row < this._rowsNumber; row++) {
      const y = row * this._tileSize.y;
      for (let col = 0; col < this._columnsNumber; col++) {
        const x = col * this._tileSize.x;
        this._updateTileByCoord(col, row, '0', await createImageBitmap(this._imageSrc, x, y, this._tileSize.x, this._tileSize.y));
      }
    }
  }

  async _loadMetadata() {
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }
}