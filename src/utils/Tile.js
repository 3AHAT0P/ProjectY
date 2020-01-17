import Point from './Point.js';

export default class Tile {
  static async fromTileSet(source, from, tileOptions) {
    const bitmap = await createImageBitmap(source.data, from.x, from.y, source.tileSize.x, source.tileSize.x);
    const instance = new this({
      bitmap,
      size: tileOptions.size || source.tileSize,
      sourceSrc: source.url,
      sourceTileSize: source.tileSize,
      sourceCoords: tileOptions.sourceCoords,
    });
    return instance;
  }
  
  _size = {
    x: 16,
    y: 16,
  };
  
  _source = {
    data: null,
    url: null,
    tileSize: {
      x: 16,
      y: 16,
    },
  };
  
  _sourceRegion = null;
  _bitmap = null;
  
  get bitmap() { return this._bitmap; }
  set bitmap(value) { throw new Error('It\'s property read only!'); }
  
  get size() { return this._size; }
  set size(value) { throw new Error('It\'s property read only!'); }
  
  get meta() {
    return {
      sourceSrc: this._source.url,
      sourceCoords: this._sourceRegion.toObject(),
    };
  }
  set meta(value) { throw new Error('It\'s property read only!'); }
  
  constructor(options = {}) {
    if (options.size != null) this._size = { ...options.size };
    if (options.bitmap != null) this._bitmap = options.bitmap;
    if (options.sourceSrc != null) this._source.url = options.sourceSrc;
    if (options.sourceTileSize != null) this._source.tileSize = { ...options.sourceTileSize };
    if (options.sourceCoords != null) this._sourceRegion = new Point(options.sourceCoords.x, options.sourceCoords.y);
  }
}
