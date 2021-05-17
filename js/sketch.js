class Sketch extends Engine {
  preload() {
    this._waves = 100;
    this._noise_scl = 0.005;
    this._time_rho = 0.005;
    this._scl = 2;
    this._peaks = 4;
    this._repetitions = 2;
    this._max_ampl = this.height / 2 * 0.5;
    this._duration = 900;
    this._recording = true;
  }

  setup() {
    // color and aberration
    this._line_colors = [
      {
        color: new Color(255, 0, 255),
        dpos: { x: 2, y: 0 },
      },
      {
        color: new Color(0, 255, 255),
        dpos: { x: -2, y: 0 },
      },
      {
        color: new Color(230, 230, 230),
        dpos: { x: 0, y: 0 },
      }
    ];
    this._background = new Color(15, 15, 15);
    // setup capturer
    this._capturer_started = false;
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
    }
    // setup noise
    this._noise = new SimplexNoise();
  }

  draw() {
    // start capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    const percent = (this.frameCount % this._duration) / this._duration;
    const time_theta = percent * Math.PI * 2 * this._repetitions;
    const nx = this._time_rho * (1 + Math.cos(time_theta));
    const ny = this._time_rho * (1 + Math.sin(time_theta));

    // array containing all the lines array
    let lines = [];
    for (let i = 0; i < this._waves; i++) {
      lines.push([]);
      // calculate coordinates
      for (let x = 0; x < this.width; x += this._scl) {
        // noise
        const n = this._noise.noise2D(x * this._noise_scl, nx, ny); // 0 to 1
        // percent of the width
        const width_ratio = x / this.width;
        // angle phase
        const phi = width_ratio * Math.PI * 2 * this._peaks;
        // angles relative to time and position
        const gamma = (i / this._waves) * Math.PI;
        const theta = width_ratio * Math.PI;
        // amplitude
        const amplitude = ((i + 1) / this._waves) * this._max_ampl * Math.sin(theta);
        const dy = amplitude * (Math.cos(phi + gamma + time_theta) + n);
        // finally add position to array
        lines[i].push({ x: x, y: dy });
      }
    }

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background.rgb;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.translate(0, this.height / 2);
    this.ctx.globalCompositeOperation = "screen";
    this.ctx.lineWidth = 1;
    // loop throught all lines
    for (let i = 0; i < lines.length; i++) {
      // useful later for alpha calculation
      const wave_ratio = (i + 1) / lines.length;
      // loop throught all colors
      for (let j = 0; j < this._line_colors.length; j++) {
        const stroke_color = this._line_colors[j].color;
        const alpha = ease(wave_ratio);
        stroke_color.alpha = alpha;
        // actual drawing here
        this.ctx.save();
        this.ctx.translate(this._line_colors[j].dpos.x, this._line_colors[j].dpos.y);
        this.ctx.strokeStyle = stroke_color.rgba;
        this.ctx.beginPath();
        // loop throught all vertex
        for (let k = 0; k < lines[i].length; k++) {
          if (k == 0) this.ctx.moveTo(lines[i][k].x, lines[i][k].y);
          else this.ctx.lineTo(lines[i][k].x, lines[i][k].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
    this.ctx.restore();

    // handle recording
    if (this._recording) {
      if (this.frameCount % 30 == 0) {
        const update = `Record: ${parseInt(percent * 100)}%`;
        console.log(`%c ${update}`, "color: yellow; font-size: 0.75rem");
      }
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }
}

const ease = (x) => x < 0.5 ? 4 * Math.pow(x, 3) : 1 - Math.pow(-2 * x + 2, 3) / 2;