import { Character } from '../utils/classes';

/**
 * @class Scene - The core of a game.
 */
export default class Scene {
  // _hero = null;
  // _ctx = null;
  _staticObjects = [];
  _dynamicObjects = [];

  /**
   * @constructor Scene
   * @param {HTMLElement} element - a place where game will be rendering
   * @param {number} [width=500] - width of a game viewport
   * @param {number} [height=500] - height of a game viewport
   */
  constructor(element, width, height) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = width || 500;
    this._canvas.height = height || 500;
    element.append(this._canvas);
    this._ctx = this._canvas.getContext('2d');
  }
  
  /**
   * Method to add a main Hero to a game
   * @param {Character} hero - Instance of the Character class which would be the main hero of a game.
   */
  addHero(hero) {
    if (hero instanceof Character) {
      this._hero = hero;
    }
    else throw new Error('Hero should be an instance of the Character class.')
  }
  
  /**
   *
   * @param object
   * @param {string} type - dynamic or static
   */
  addObject(object, type) {
    if (object && type === 'static') this._staticObjects.push(object);
    if (object && type === 'dynamic') this._dynamicObjects.push(object);
  }

  start() {
    this._paused = false;
    this._render();
  }

  pause() {
    this._paused = true;
  }
  
  checkBeyondPosition(x, y, width, height) {
    if (x <= 0) return false;
    if (x + width >= this._canvas.width) return false;
    if (y < 0) return false;
    return y + height < this._canvas.height;
  }

  /**
   * If object has collision with any static object returns true.
   * @param {Character} object
   * @returns {boolean}
   */
  checkMoveCollisions(object) {
    return this._staticObjects.some(obj => this._detectCollision(object, obj))
  }

  /**
   * If object has collision with any dynamic object returns true.
   * It means that object receives a damage.
   * @param {Character} object
   * @returns {boolean}
   */
  checkDamageCollisions(object) {
    return this._dynamicObjects.some(obj => this._detectCollision(object, obj))
  }

  _render() {
    if (this._paused) return;

    requestAnimationFrame(this._render.bind(this));
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._renderBackground();
    this._renderObjects();
    this._renderHero();
  }

  _renderBackground() {}
  
  _renderObjects() {
    this._staticObjects.forEach(staticObject => this._renderObject(staticObject));
    this._dynamicObjects.forEach(dynamicObject => this._renderObject(dynamicObject));
  }

  _renderHero() {
    this._renderObject(this._hero);
  }
  
  _renderObject(object) {
    const { position, width, height } = object;
    this._ctx.drawImage(
      object.render(),
      0,
      0,
      width,
      height,
      position.x,
      position.y,
      width,
      height,
    );
  }

  _detectCollision(a, b) {
    const ax2 = a.position.x + a.width;
    const ay2 = a.position.y + a.height;
    const bx2 = b.position.x + b.width;
    const by2 = b.position.y + b.height;
    
    return !(ax2 < b.x || a.x > bx2 || ay2 < b.y || a.y > by2);
  }
}