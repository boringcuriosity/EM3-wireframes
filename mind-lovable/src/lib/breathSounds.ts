/** Subtle WebAudio cues for breathing exercises — no external assets. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call once from a user gesture so mobile browsers allow audio. */
export function primeAudio() {
  getCtx();
}

interface ToneOptions {
  from: number;
  to: number;
  duration: number;
  peak?: number;
}

function tone({ from, to, duration, peak = 0.06 }: ToneOptions) {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;

  const osc = audio.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.linearRampToValueAtTime(to, now + duration);

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.35, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;

  osc.connect(filter).connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export function playInhaleCue() {
  tone({ from: 220, to: 330, duration: 1.4 });
}

export function playHoldCue() {
  tone({ from: 300, to: 300, duration: 0.7, peak: 0.035 });
}

export function playExhaleCue() {
  tone({ from: 330, to: 196, duration: 1.8 });
}

export function playCueFor(kind: 'inhale' | 'hold' | 'exhale') {
  if (kind === 'inhale') playInhaleCue();
  else if (kind === 'exhale') playExhaleCue();
  else playHoldCue();
}
