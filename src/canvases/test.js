import CustomCanvas from '/src/canvases/custom-canvas.js';
import ResizeableCanvasMixin from '/src/canvases/mixins/resizeable-canvas.js';

class TestCanvas extends ResizeableCanvasMixin(CustomCanvas) {

}

const runTest = async () => {
  const testCanvas = await TestCanvas.create({ el: document.body, size: { width: 64, height: 64 } });
  console.assert(testCanvas.height === 64, 'FAIL1!');
  console.assert(testCanvas._sizeMultiplier === 1, 'FAIL2!');
  testCanvas.addEventListener('render', _ => console.log('2'), { passive: true });
  testCanvas.dispatchEvent(new Event('renderRequest'));

}

export default runTest;
