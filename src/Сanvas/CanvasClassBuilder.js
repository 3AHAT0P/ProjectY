import Canvas from './index.js';

import SelectableCanvasMixin from './mixins/selectableCanvas.js';
import ResizeableCanvasMixin from './mixins/resizeableCanvas.js';
import TileableCanvasMixin from './mixins/tileableCanvas.js';
import DrawableCanvasMixin from './mixins/drawableCanvas.js';

const MIXINS = {
  selectable: SelectableCanvasMixin,
  resizable: ResizeableCanvasMixin,
  tileable: TileableCanvasMixin,
  drawable: DrawableCanvasMixin,
};

export default class CanvasClassBuilder {
  klass = Canvas;
  mixins = {
    selectable: false,
    resizable: false,
    tileable: false,
    drawable: false,
  };
  
  applySelectableMixin() {
    this.mixins.selectable = true;
    return this;
  }
  
  applyResizeableMixin() {
    this.mixins.resizable = true;
    return this;
  }
  
  applyTileableMixin() {
    this.mixins.tileable = true;
    return this;
  }
  
  applyDrawableMixin() {
    this.mixins.drawable = true;
    return this;
  }
  
  build() {
    let klass = this.klass;
    for (const [key, flag] of Object.entries(this.mixins)) {
      if (flag) klass = MIXINS[key](klass);
    }
    return klass;
  }
  
  instantiate(options) {
    const klass = this.build();
    return klass.create(options);
  }
}
