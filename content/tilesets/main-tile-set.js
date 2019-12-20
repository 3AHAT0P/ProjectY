export default class MineTileSet {
  static async create(...args) {
    const instance = new this(...args);
    await instance.init();
    return instance;
  }

  srcLink = '/content/tilesets/main-tile-set.png';
  src = null;

  columnsNumber = 0;
  rowsNumber = 0;

  tileSize = {
    x: 16,
    y: 16,
  };

  tilesMeta = {
    'landLeftTopCorner': '0|19',
    'landTopSide': '0|20',
    'landRightTopCorner': '0|21',
  }

  tiles = new Map();

  _latestSelectedTile = null;

  _onSelect(x, y) {
    if (this.onSelect != null) this.onSelect(this.tiles.get(`${y}|${x}`));
    const converBitmapToBlob = (img) =>
      new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob(res);
      });

    converBitmapToBlob(this.tiles.get(`${y}|${x}`)).then((data) => this._latestSelectedTile = URL.createObjectURL(data))
  }

  constructor(options, handlers) {
    this.onSelect = handlers.onSelect;
  }

  async init() {
    await this.load();
    await this.parse();
    await this.testRender();
  }

  async load() {
    this.src = new Image();
    await new Promise((resolve, reject) => {
      this.src.onload = resolve;
      this.src.onerror = reject;
      this.src.src = this.srcLink;
    });
  }

  async parse() {
    this.columnsNumber = this.src.width / this.tileSize.x;
    this.rowsNumber = this.src.height / this.tileSize.y;

    for (let row = 0; row < this.rowsNumber; row++) {
      const y = row * this.tileSize.y;
      for (let col = 0; col < this.columnsNumber; col++) {
        const x = col * this.tileSize.x;
        this.tiles.set(`${row}|${col}`, await createImageBitmap(this.src, x, y, this.tileSize.x, this.tileSize.y));
      }
    }
  }

  async testRender() {
    const margin = 0;
    const topOffset = 16;
    const leftOffset = 16;
    const fontSize = 10;

    const render = ({ctx, target: canvas}) => {
      canvas.clear();
  
      for (const [key, tile] of this.tiles.entries()) {
        let [y, x] = key.split('|');
        x = Number(x) * this.tileSize.x + Number(x) * margin + leftOffset;
        y = Number(y) * this.tileSize.y + Number(y) * margin + topOffset;
        ctx.drawImage(tile, 0, 0, tile.width, tile.height, x * canvas.sizeMultiplier, y * canvas.sizeMultiplier, this.tileSize.x * canvas.sizeMultiplier, this.tileSize.y * canvas.sizeMultiplier);
      }
      for (let i = 0; i <= this.columnsNumber; ++i) {
        ctx.save();
        ctx.font = `${fontSize * canvas.sizeMultiplier}px serif`;
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'hsla(0, 100%, 0%, 60%)';
        const textMetrics = ctx.measureText(`${i}`);
        ctx.fillText(`${i}`, (leftOffset + this.tileSize.x / 2 + i * margin + i * this.tileSize.x) * canvas.sizeMultiplier - textMetrics.width / 2, (this.tileSize.y / 2) * canvas.sizeMultiplier + textMetrics.emHeightAscent / 2);
        const lineX = leftOffset - margin / 2 + i * margin + i * this.tileSize.x;
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.lineWidth = 1;
        ctx.moveTo(lineX * canvas.sizeMultiplier, 0);
        ctx.lineTo(lineX * canvas.sizeMultiplier, canvas.height * canvas.sizeMultiplier);
        ctx.stroke();
        ctx.restore();
      }
  
      for (let i = 0; i <= this.rowsNumber; ++i) {
        ctx.save();
        ctx.font = `${fontSize * canvas.sizeMultiplier}px serif`;
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'hsla(0, 100%, 0%, 60%)';
        const textMetrics = ctx.measureText(`${i}`);
        ctx.fillText(`${i}`, (this.tileSize.x / 2) * canvas.sizeMultiplier - textMetrics.width / 2, (topOffset + this.tileSize.y / 2 + i * margin + i * this.tileSize.y) * canvas.sizeMultiplier + textMetrics.emHeightAscent / 2);
        const lineY = topOffset - margin / 2 + i * margin + i * this.tileSize.y;
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.lineWidth = 1;
        ctx.moveTo(0, lineY * canvas.sizeMultiplier);
        ctx.lineTo(canvas.width, lineY * canvas.sizeMultiplier);
        ctx.stroke();
        ctx.restore();
      }
    }

    const onSelect = ({ nativeEvent: event, target: canvas }) => {
      const x = Math.trunc((event.layerX / canvas.sizeMultiplier - leftOffset) / (this.tileSize.x + margin));
      const y = Math.trunc((event.layerY / canvas.sizeMultiplier - topOffset) / (this.tileSize.y + margin));
      this._onSelect(x, y);
    }

    const getCursor = () => {
      return this._latestSelectedTile;
    }

    const { ResizeableCanvas } = await import('/src/canvases/mixins/resizeable-canvas.js');
    const { default: SelectableCanvasMixin } = await import('/src/canvases/mixins/selectable-canvas.js');

    const canvas = await SelectableCanvasMixin(ResizeableCanvas).create({
      el: document.body,
      size: {
        width: leftOffset + this.src.width + this.columnsNumber * margin + margin,
        height: topOffset + this.src.height + this.rowsNumber * margin + margin,
      },
    });

    canvas.addEventListener(':render', render);
    canvas.addEventListener(':select', onSelect);

  }
}