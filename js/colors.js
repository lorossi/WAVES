// Simple class to handle colors
// Needed? No. Useful? Maybe. Hotel? Trivago.
// sorry, that was lame.
class Color {
  constructor(r, g, b, a = 1) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  get alpha() {
    return this._a;
  }

  set alpha(a) {
    this._a = a;
  }

  get rgb() {
    return `rgb(${this._r}, ${this._g}, ${this._b})`;
  }

  get rgba() {
    return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
  }

  get channel() {
    return {
      monochromatic: this._r == this._g && this._g == this._b,
      channel: this._r,
    };
  }

  set channel(s) {
    this._r = s;
    this._g = s;
    this._b = s;
  }
}