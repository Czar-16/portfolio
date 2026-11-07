let context: AudioContext | undefined;

/** A short low thump and bright snap for comic-style shout interactions. */
export async function playComicHit() {
  try {
    if (typeof AudioContext === "undefined") return;
    context ??= new AudioContext();
    const audio = context;
    if (audio.state === "suspended") await audio.resume();
    if (audio.state !== "running") return;

    const now = audio.currentTime;
    const thump = audio.createOscillator();
    const thumpGain = audio.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(125, now);
    thump.frequency.exponentialRampToValueAtTime(48, now + 0.16);
    thumpGain.gain.setValueAtTime(0.42, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    thump.connect(thumpGain).connect(audio.destination);
    thump.start(now);
    thump.stop(now + 0.2);

    const snap = audio.createOscillator();
    const snapGain = audio.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(1050, now);
    snap.frequency.exponentialRampToValueAtTime(260, now + 0.075);
    snapGain.gain.setValueAtTime(0.16, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    snap.connect(snapGain).connect(audio.destination);
    snap.start(now);
    snap.stop(now + 0.09);

    // A quick airy rise gives the hit a shonen-style motion cue.
    const length = Math.ceil(audio.sampleRate * 0.12);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const whoosh = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const whooshGain = audio.createGain();
    whoosh.buffer = buffer;
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.11);
    whooshGain.gain.setValueAtTime(0.001, now);
    whooshGain.gain.linearRampToValueAtTime(0.12, now + 0.045);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    whoosh.connect(filter).connect(whooshGain).connect(audio.destination);
    whoosh.start(now);
    whoosh.stop(now + 0.125);

    const sparkle = audio.createOscillator();
    const sparkleGain = audio.createGain();
    sparkle.type = "sine";
    sparkle.frequency.setValueAtTime(1760, now + 0.035);
    sparkle.frequency.exponentialRampToValueAtTime(1180, now + 0.16);
    sparkleGain.gain.setValueAtTime(0.001, now);
    sparkleGain.gain.setValueAtTime(0.07, now + 0.035);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    sparkle.connect(sparkleGain).connect(audio.destination);
    sparkle.start(now + 0.035);
    sparkle.stop(now + 0.18);
  } catch {
    // Audio support and autoplay policies must never interrupt the interaction.
  }
}
