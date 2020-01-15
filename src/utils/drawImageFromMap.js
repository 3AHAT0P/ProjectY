import getTilesRectSizes from './getTilesRectSizes.js';

export default function (tiles, ctx, width = 64, height = 64, contain) {
  const canvasWidth = width;
  const canvasHeight = height;
  const { xCount, yCount } = getTilesRectSizes(tiles);
  
  const maxAxios = Math.max(xCount, yCount);
  const tileWidth = canvasWidth / (contain ? maxAxios : xCount);
  const tileHeight = canvasHeight / (contain ? maxAxios : yCount);
  
  for (const [place, tile] of tiles.entries()) {
    const [y, x] = place.split('|');
    ctx.drawImage(tile.bitmap, Number(x) * tileWidth, Number(y) * tileHeight, tileWidth, tileHeight);
  }
}
