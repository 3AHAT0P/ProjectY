import { Character } from '../utils/classes';

/**
 * @class Scene - The core of a game.
 */
export default class Scene {
  // _hero = null;
  // _ctx = null;

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

  start() {
    this._paused = false;
    this._render();
  }

  pause() {
    this._paused = true;
  }
  
  checkPosition(x, y, width, height) {
    if (x <= 0) return false;
    if (x + width >= this._canvas.width) return false;
    if (y < 0) return false;
    return y + height < this._canvas.height;
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
  
  _renderObjects() {}

  _renderHero() {
    const { position, width, height } = this._hero;
    this._ctx.drawImage(
      this._hero.render(),
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
}
