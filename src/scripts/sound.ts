/**
 * Sound for the whole site. Always off until the visitor turns it on.
 * The projector sounds are generated in the browser, so there are no audio files.
 */

type Listener = (on: boolean) => void;

const KEY = 'bohrscope:sound';
const listeners = new Set<Listener>();
let on = false;

try {
  on = sessionStorage.getItem(KEY) === 'on';
} catch {
  /* private mode: start silent */
}

export const isSoundOn = () => on;

export function setSound(value: boolean) {
  if (value === on) return;
  on = value;
  try {
    sessionStorage.setItem(KEY, value ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (!value) projector.stop(0.4);
  listeners.forEach((fn) => fn(on));
  document.documentElement.toggleAttribute('data-sound', on);
}

export function onSound(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(ac: AudioContext, seconds = 2) {
  const buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise: softer than white noise, closer to a motor.
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

/** A 16mm projector: a soft motor, a gate rattling at 24 frames per second. */
export const projector = (() => {
  let nodes: { src: AudioBufferSourceNode; lfo: OscillatorNode; out: GainNode } | null = null;

  return {
    start(volume = 0.16, fadeIn = 0.8) {
      if (!on) return;
      const ac = audio();
      if (!ac || nodes) return;
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer(ac);
      src.loop = true;

      const band = ac.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 900;
      band.Q.value = 0.7;

      // The gate: amplitude pulsing 24 times a second.
      const gate = ac.createGain();
      gate.gain.value = 0.55;
      const lfo = ac.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 24;
      const depth = ac.createGain();
      depth.gain.value = 0.45;
      lfo.connect(depth).connect(gate.gain);

      const out = ac.createGain();
      out.gain.value = 0;
      out.gain.linearRampToValueAtTime(volume, ac.currentTime + fadeIn);

      src.connect(band).connect(gate).connect(out).connect(ac.destination);
      src.start();
      lfo.start();
      nodes = { src, lfo, out };
    },
    stop(fadeOut = 1.2) {
      if (!nodes || !ctx) return;
      const { src, lfo, out } = nodes;
      nodes = null;
      const t = ctx.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + fadeOut);
      src.stop(t + fadeOut + 0.05);
      lfo.stop(t + fadeOut + 0.05);
    },
  };
})();

/** A short mechanical click, like a shutter or a switch on the projector. */
export function click(strength = 1) {
  if (!on) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.08);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.5 * strength, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  src.connect(hp).connect(g).connect(ac.destination);
  src.start(t);

  const thump = ac.createOscillator();
  thump.frequency.setValueAtTime(140, t);
  thump.frequency.exponentialRampToValueAtTime(50, t + 0.09);
  const tg = ac.createGain();
  tg.gain.setValueAtTime(0.35 * strength, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  thump.connect(tg).connect(ac.destination);
  thump.start(t);
  thump.stop(t + 0.12);
}

document.documentElement.toggleAttribute('data-sound', on);
