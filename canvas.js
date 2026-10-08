// canvas.js — Canvas rendering class

class Canvas {
  constructor(canvasId) {
    this.el = document.getElementById(canvasId);
    this.ctx = this.el.getContext('2d');
    this._fixedW = 0;
    this._fixedH = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  get width()  { return this.el.width; }
  get height() { return this.el.height; }

  // Called when the user confirms a document size in the New Document dialog.
  setFixedSize(w, h) {
    this._fixedW = w;
    this._fixedH = h;
    this.el.width  = w;
    this.el.height = h;
    // Switch canvas-area to workbench mode (centered, scrollable, gray bg)
    document.getElementById('canvas-area')?.classList.add('fixed-mode');
    this._applyDisplayScale();
  }

  // Scale the canvas-wrapper so the document fits visible area; buffer stays full-res.
  _applyDisplayScale() {
    const area = document.getElementById('canvas-area');
    if (!area) return;
    const pad   = 40;
    const maxW  = Math.max(1, area.clientWidth  - pad * 2);
    const maxH  = Math.max(1, area.clientHeight - pad * 2);
    const scale = Math.min(1, maxW / this._fixedW, maxH / this._fixedH);
    const dW    = Math.round(this._fixedW  * scale);
    const dH    = Math.round(this._fixedH * scale);
    const wrap  = document.getElementById('canvas-wrapper');
    if (wrap) { wrap.style.width = dW + 'px'; wrap.style.height = dH + 'px'; }
  }

  _resize() {
    if (this._fixedW) { this._applyDisplayScale(); return; }
    // Auto mode: size buffer to match the wrapper's actual rendered dimensions.
    const wrap = document.getElementById('canvas-wrapper');
    const W = wrap ? wrap.clientWidth  : this.el.parentElement.clientWidth;
    const H = wrap ? wrap.clientHeight : this.el.parentElement.clientHeight;
    if (W > 0 && H > 0) { this.el.width = W; this.el.height = H; }
  }

  clear(bg = '#111111') {
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawText(text, x, y, { fontSize = 80, fontFamily = 'monospace', color = '#cccccc', bold = false } = {}) {
    const weight = bold ? 'bold ' : '';
    this.ctx.font = `${weight}${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText(text, x, y);
  }

  getCharPositions(text, originX, originY, fontSize = 80, fontFamily = 'monospace') {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'alphabetic';
    const positions = [];
    let curX = originX;
    for (const char of text) {
      if (char === '\n') { curX = originX; originY += fontSize * 1.3; continue; }
      const metrics = this.ctx.measureText(char);
      const w = metrics.width;
      if (char !== ' ') positions.push({ char, x: curX, y: originY, w, h: fontSize });
      curX += w;
    }
    return positions;
  }

  measureText(text, fontSize = 80, fontFamily = 'monospace') {
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    return this.ctx.measureText(text).width;
  }
}
