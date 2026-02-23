export function exportCanvasPng(canvas: HTMLCanvasElement, filename = 'nebula-export.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
