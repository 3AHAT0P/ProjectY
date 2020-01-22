import MainTileSet from './content/tilesets/MainTileSet.js';
import MainTileMap from './content/tilemaps/MainTileMap.js';
import CustomCanvas from './src/canvases/СustomCanvas.js';
import ResizeableCanvasMixin from './src/canvases/mixins/resizeable.js';
import TileableCanvasMixin from './src/canvases/mixins/tileable.js';
import DrawableCanvasMixin from './src/canvases/mixins/drawable.js';
import drawImageFromMap from './src/utils/drawImageFromMap.js';
import Character from './src/classes/Character.js';

const MainCanvas = DrawableCanvasMixin(TileableCanvasMixin(ResizeableCanvasMixin(CustomCanvas)));

const createButton = (to, label, onClick) => {
  const button = document.createElement('button');
  button.textContent = label;
  button.addEventListener('click', onClick);
  to.append(button);
  return button;
};

const saveMap = async (canvas) => {
  const a = document.createElement("a");
  a.style = "display: none";
  document.body.appendChild(a);
  
  const { meta } = await canvas.save();
  
  const blob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
  a.href = URL.createObjectURL(blob);
  a.download = 'tilemap.json';
  a.click();
  URL.revokeObjectURL(a.href);
  
  a.remove();
};

const main = async () => {
  const mainCanvas = await MainCanvas.create({ el: document.getElementById('main'), size: { width: 512, height: 512 } });
  const saveButton = createButton(document.body, 'Save', () => saveMap(mainCanvas));
  const currentTileCanvas = await CustomCanvas.create({ el: document.getElementById('current'), size: { width: 64, height: 64 } });
  const mainTileSet = await MainTileSet.create({ el: document.getElementById('tileSet') });

  mainTileSet.addEventListener(':multiSelect', ({ tiles }) => {
    mainCanvas.updateCurrentTiles(tiles);
    mainCanvas.dispatchEvent(new Event(':renderRequest'));
    if (tiles != null) {
      currentTileCanvas.addEventListener(':render', (event) => {
        drawImageFromMap(tiles, event.ctx, 64, 64, true);
      }, { once: true });
      currentTileCanvas.dispatchEvent(new Event(':renderRequest'));
    }
  });

  const tileMap = await MainTileMap.create({ el: document.getElementById('tileMap'), size: { width: 512, height: 512 } });
}

// main();
async function test() {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const player = await Character.create(
      {
        coreElement: canvas,
        position: { x: 0, y: 0 },
        mainSettings: {
          mainFlipbook: './content/sources/PNG/Knight/knight.png',
          speed: 300,
        },
        moveSettings: {
          moveFlipbook: [
            './content/sources/PNG/Knight/Run/run1.png',
            './content/sources/PNG/Knight/Run/run2.png',
            './content/sources/PNG/Knight/Run/run3.png',
            './content/sources/PNG/Knight/Run/run4.png',
            './content/sources/PNG/Knight/Run/run5.png',
            './content/sources/PNG/Knight/Run/run6.png',
            './content/sources/PNG/Knight/Run/run7.png',
            './content/sources/PNG/Knight/Run/run8.png',
          ],
        },
        jumpSettings: {
          jumpFlipbook: [
            './content/sources/PNG/Knight/Jump/jump1.png',
            './content/sources/PNG/Knight/Jump/jump2.png',
            './content/sources/PNG/Knight/Jump/jump3.png',
            './content/sources/PNG/Knight/Jump/jump4.png',
            './content/sources/PNG/Knight/Jump/jump5.png',
            './content/sources/PNG/Knight/Jump/jump6.png',
            './content/sources/PNG/Knight/Jump/jump7.png',
          ],
        },
        attackSettings: {
          attackFlipbook: [
            './content/sources/PNG/Knight/Attack/attack0.png',
            './content/sources/PNG/Knight/Attack/attack1.png',
            './content/sources/PNG/Knight/Attack/attack2.png',
            './content/sources/PNG/Knight/Attack/attack4.png',
          ],
        },
      }
    );
  const tick = () => {
    // setTimeout(this.tick, 1000);
    requestAnimationFrame(tick);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      player.render(),
      0,
      0,
      player.width,
      player.height,
      0,
      0,
      player.width,
      player.height,
    );
  };
  tick();
}

test();

