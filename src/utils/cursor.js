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

  updateImageFromBitmap(bitmap) {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    // canvas.toBlob((data) => this._url = URL.createObjectURL(data));
    this._url = canvas.toDataURL();
  }

  showCursor() {
    target.style.cursor = this.cursor;
  }

  hideCursor() {
    target.style.cursor = 'unset';
  }
}