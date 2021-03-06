import drawImageFromMap from '../utils/drawImageFromMap.js';
import getTilesRectSizes from '../utils/getTilesRectSizes.js';

const updateImageColorVolume = (imageData) => {
  let pixels = imageData.data;
  for(let i = 0; i < pixels.length; i += 4) {
    // red is pixels[i];
    // green is pixels[i + 1];
    // blue is pixels[i + 2];
    // alpha is pixels[i + 3];
    // all values are integers between 0 and 255
    // do with them whatever you like. Here we are reducing the color volume to 98%
    // without affecting the alpha channel
    pixels[i] = pixels[i] * 0.95;
    pixels[i+1] = pixels[i+1] * 0.85;
    pixels[i+2] = pixels[i+2] * 0.85;
  }
  return imageData;
}

export default class Cursor {
  _el = null;
  _url = null;
  _offset = {
    x: 0,
    y: 0,
  };

  get cursor() {
    return `url(${this._url}) ${this._offset.x} ${this._offset.y}, pointer`;
  }

  constructor(target, options) {
    this._el = target;

    if (options.offset != null) this._offset = options.offset;
  }

  async updateImageFromBitmap(tiles) {
    const canvas = document.createElement('canvas');
    canvas.style['image-rendering'] = 'pixelated';
    const { xCount, yCount } = getTilesRectSizes(tiles);
    
    canvas.width = 16 * xCount > 128 ? 128 : 16 * xCount;
    canvas.height = 16 * yCount > 128 ? 128 : 16 * yCount;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawImageFromMap(tiles, ctx, canvas.width, canvas.height);
    
    // When we use image from canvas as a cursor, image brightness and color volume is increased. So we need decrease it before set as the cursor
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageData = updateImageColorVolume(imageData);
    ctx.putImageData(imageData, 0, 0);
    const data = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    this._url = URL.createObjectURL(data);

    // this._url = canvas.toDataURL();
  }

  showCursor() {
    this._el.style.cursor = this.cursor;
  }

  hideCursor() {
    this._el.style.cursor = 'unset';
  }
}
