import MainTileSet from '/content/tilesets/main-tile-set.js';
import MainTileMap from '/content/tilemaps/tile-map.js';
import CustomCanvas from '/src/canvases/custom-canvas.js';
import ResizeableCanvasMixin from '/src/canvases/mixins/resizeable-canvas.js';
import TileableCanvasMixin from '/src/canvases/mixins/tileable-canvas.js';
import DrawableCanvasMixin from '/src/canvases/mixins/drawable-canvas.js';

const MainCanvas = DrawableCanvasMixin(TileableCanvasMixin(ResizeableCanvasMixin(CustomCanvas)));

const createButton = (to, label, onClick) => {
  const button = document.createElement('button');
  button.textContent = label;
  button.addEventListener('click', onClick);
  to.append(button);
  return button;
};

const main = async () => {
  const mainCanvas = await MainCanvas.create({ el: document.body, size: { width: 512, height: 512 } });
  const saveButton = createButton(document.body, 'Save', () => mainCanvas.save());
  const currentTileCanvas = await CustomCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  const mainTileSet = await MainTileSet.create({ el: document.body });

  mainTileSet.addEventListener(':select', ({ tile }) => {
    mainCanvas.updateCurrentTile(tile);
    mainCanvas.dispatchEvent(new Event(':renderRequest'));
    currentTileCanvas.addEventListener(':render', (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); }, { once: true });
    currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
  });

  mainTileSet.addEventListener(':multiSelect', ({ tiles }) => {
    mainCanvas.updateCurrentTiles(tiles);
    mainCanvas.dispatchEvent(new Event(':renderRequest'));
    if (tiles != null) {
      currentTileCanvas.addEventListener(':render', (event) => {
        const width = 64;
        const height = 64;
        let maxX = 0;
        let maxY = 0;
        for (const [place, tile] of tiles.entries()) {
          const [y, x] = place.split('|');
          if (Number(y) > maxY) maxY = Number(y);
          if (Number(x) > maxX) maxX = Number(x);
        }
        const tileWidth = width / (maxX + 1);
        const tileHeight = height / (maxX + 1);
        for (const [place, tile] of tiles.entries()) {
          const [y, x] = place.split('|');
          event.ctx.drawImage(tile, Number(x) * tileWidth, Number(y) * tileHeight, tileWidth, tileHeight);
        }
      }, { once: true });
      currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
    }
  });

  const tileMap = await MainTileMap.create({ el: document.body, size: { width: 512, height: 512 } });
}

main();