import { DrawableCanvas } from '../../src/canvases/mixins/drawable-canvas.js';

export default class MineTileMap extends DrawableCanvas {

  _imageSrcLink = './content/tilemaps/tilemap.png';
  _imageSrc = null;

  _metadataSrcLink = './content/tilemaps/tilemap.json';
  _metadataSrc = null;

  async init() {
    await super.init();

    await this._loadImage();
    await this._loadMetadata();
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
    this.updateSize(this._imageSrc.width, this._imageSrc.height);
  }

  async _loadMetadata() {
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }
}
