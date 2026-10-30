/** Short filtered noise click, matching ramx.in's Web Audio timbre. */
export class ClickSound {
  private context?: AudioContext;
  private filter?: BiquadFilterNode;
  private gain?: GainNode;

  async play() {
    try {
      if (!this.context) {
        if (typeof AudioContext === "undefined") return;
        this.context = new AudioContext();
        this.filter = this.context.createBiquadFilter();
        this.filter.type = "bandpass";
        this.filter.Q.value = 8;
        this.gain = this.context.createGain();
        this.gain.gain.value = 0.35;
        this.filter.connect(this.gain);
        this.gain.connect(this.context.destination);
      }
      const context = this.context;
      if (context.state === "suspended") await context.resume();
      if (this.context !== context || context.state !== "running") return;

      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.004), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / 25);
      }
      this.filter!.frequency.value = 3400 * (1 + (Math.random() - 0.5) * 0.3);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.filter!);
      source.onended = () => source.disconnect();
      source.start();
    } catch {
      // Audio support and autoplay policies must never interrupt an action.
    }
  }

  stop() {
    if (this.gain && this.context) this.gain.gain.value = 0;
  }

  enable() {
    if (this.gain) this.gain.gain.value = 0.35;
  }

  dispose() {
    const context = this.context;
    this.context = undefined;
    this.filter?.disconnect();
    this.gain?.disconnect();
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }
}
