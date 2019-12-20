import MainTileSet from '/content/tilesets/main-tile-set.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';
import ResizeableCanvasMixin from '/src/canvases/mixins/resizeable-canvas.js';
import TileableCanvasMixin from '/src/canvases/mixins/tileable-canvas.js';

const MainCanvas = TileableCanvasMixin(ResizeableCanvasMixin(CustomCanvas));

const main = async () => {
  const mainCanvas = await MainCanvas.create({ el: document.body, size: { width: 512, height: 512 } });
  const currentTileCanvas = await CustomCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  // const mainCanvas = await MainCanvas.create({ el: document.body, size: { width: 512, height: 512 } });

  // const canvas = await Canvas.create({ el: document.body, size: { width: 512, height: 512 } });
  // const currentTileCanvas = await SimpleCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  // currentTileCanvas.addEventListener('render', (event) => { if (canvas.tile != null) event.ctx.drawImage(canvas.tile, 0, 0, 64, 64); });
  await MainTileSet.create({}, {
    onSelect(tile) {
      mainCanvas.tile = tile;
      mainCanvas.dispatchEvent(new Event(':renderRequest'));
      currentTileCanvas.addEventListener('render', (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); });
    }
  });
}

main();