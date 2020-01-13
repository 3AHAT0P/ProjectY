const DELIMITER = '|';

export default class Point {
  static fromString(value) {
    const [x, y] = value.split(DELIMITER);
    return new this(Number(x), Number(y));
  }
  
  static isEqual(x1, y1, x2, y2) {
    return Number(x1) === Number(x2) && Number(y1) === Number(y2);
  }
  
  _x = 0;
  _y = 0;
  
  get x() { return this._x; }
  set x(value) { throw new Error('It\'s property read only!'); }
  
  get y() { return this._y; }
  set y(value) { throw new Error('It\'s property read only!'); }
  
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }
  
  toString() {
    return `${this.x}${DELIMITER}${this.y}`;
  }
  
  toArray() {
    return [this.x, this.y];
  }
  
  isEqualTo(x, y) {
    return this.constructor.isEqual(this.x, this.y, x, y);
  }
}
