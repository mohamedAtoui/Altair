class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.y = value;
      this.s = value;
    } else {
      this.s = alpha * value + (1 - alpha) * this.s!;
      this.y = this.s;
    }
    return this.y;
  }

  lastValue(): number {
    return this.y ?? 0;
  }

  reset() {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private freq: number;
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTime: number | null = null;

  constructor(
    freq = 30,
    minCutoff = 1.0,
    beta = 0.007,
    dCutoff = 1.0
  ) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(cutoff: number): number {
    const te = 1.0 / this.freq;
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  filter(value: number, timestamp?: number): number {
    if (this.lastTime !== null && timestamp !== undefined) {
      const dt = timestamp - this.lastTime;
      if (dt > 0) this.freq = 1.0 / dt;
    }
    this.lastTime = timestamp ?? null;

    const prevValue = this.xFilter.lastValue();
    const dx = this.freq > 0 ? (value - prevValue) * this.freq : 0;
    const edx = this.dxFilter.filter(dx, this.alpha(this.dCutoff));
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(value, this.alpha(cutoff));
  }

  reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

export class OneEuroFilter3D {
  private filters: [OneEuroFilter, OneEuroFilter, OneEuroFilter];

  constructor(freq = 30, minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.filters = [
      new OneEuroFilter(freq, minCutoff, beta, dCutoff),
      new OneEuroFilter(freq, minCutoff, beta, dCutoff),
      new OneEuroFilter(freq, minCutoff, beta, dCutoff),
    ];
  }

  filter(
    x: number,
    y: number,
    z: number,
    timestamp?: number
  ): [number, number, number] {
    return [
      this.filters[0].filter(x, timestamp),
      this.filters[1].filter(y, timestamp),
      this.filters[2].filter(z, timestamp),
    ];
  }

  reset() {
    this.filters.forEach((f) => f.reset());
  }
}
