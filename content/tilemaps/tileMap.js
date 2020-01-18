import { DrawableCanvas } from '../../src/canvases/mixins/drawable.js';

export default class MineTileMap extends DrawableCanvas {
  _imageSrcLink = './content/tilemaps/tilemap.png';
  _imageSrc = null;
  _sourceTileMapSize = {
    width: null,
    height: null,
  };

  _metadataSrcLink = './content/tilemaps/tilemap.json';
  _metadataSrc = null;
  
  constructor(options= {}) {
    super(options);
    
    this._imageSrcLink = options.imageUrl || this._imageSrcLink;
    this._metadataSrcLink = options.metadataUrl || this._metadataSrcLink;
  }
  
  async init() {
    await super.init();

    await this._loadMetadata();
    await this._loadImage();
    await this.load({ meta: this._metadataSrc, img: this._imageSrc });

    this._renderInNextFrame();
  }

  async _loadImage() {
    this._imageSrc = new Image();
    await new Promise((resolve, reject) => {
      this._imageSrc.onload = resolve;
      this._imageSrc.onerror = reject;
      this._imageSrc.src = this._imageSrcLink;
    });
    
    const canvasWidth = this._sourceTileMapSize.width || this._imageSrc.width;
    const canvasHeight = this._sourceTileMapSize.height || this._imageSrc.height;
    this.updateSize(canvasWidth, canvasHeight);
  }

  async _loadMetadata() {
    const metaDataJson = await (await fetch(this._metadataSrcLink)).json();
    this._metadataSrc = metaDataJson.tileHash;
    this._imageSrcLink = Object.entries(this._metadataSrc)[0][1].sourceSrc;
    this._sourceTileMapSize = metaDataJson.tileMapSize;
  }
}
