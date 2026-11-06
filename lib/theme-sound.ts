/** A brief rising or falling sine tone for an explicit theme change. */
export class ThemeSound {
  private context?: AudioContext;
  private voices = new Set<OscillatorNode>();
  private generation = 0;

  async play(theme: "light" | "dark") {
    try {
      if (typeof AudioContext === "undefined") return;
      // Also cancel a tone still waiting for the browser to unlock audio.
      this.stop();
      const generation = this.generation;
      const context = this.context ??= new AudioContext();
      if (context.state === "suspended") await context.resume();
      if (generation !== this.generation || this.context !== context || context.state !== "running") return;

      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const now = context.currentTime;
      const [from, to] = theme === "light" ? [420, 620] : [620, 420];
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(to, now + 0.09);
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(0.09, now + 0.015);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
        this.voices.delete(oscillator);
      };
      this.voices.add(oscillator);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
    } catch {
      // Unsupported or blocked audio must never prevent a theme change.
    }
  }

  stop() {
    this.generation++;
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
  }

  dispose() {
    this.stop();
    const context = this.context;
    this.context = undefined;
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }
}
