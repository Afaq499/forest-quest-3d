export type SoundName = 'collect' | 'jump' | 'hurt' | 'win' | 'lose' | 'click';

let context: AudioContext | null = null;
let muted = false;

export function setAudioMuted(next: boolean) {
  muted = next;
}

export function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    context = new AudioCtx();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(
  audio: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number,
) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo !== undefined) oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSound(name: SoundName) {
  if (muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const now = audio.currentTime + 0.01;

  if (name === 'collect') {
    tone(audio, 620, now, 0.09, 'triangle', 0.08);
    tone(audio, 830, now + 0.07, 0.12, 'triangle', 0.07);
    return;
  }
  if (name === 'jump') {
    tone(audio, 220, now, 0.1, 'square', 0.035, 90);
    return;
  }
  if (name === 'hurt') {
    tone(audio, 180, now, 0.18, 'sawtooth', 0.05, 70);
    return;
  }
  if (name === 'win') {
    [523, 659, 784, 1046].forEach((frequency, index) => {
      tone(audio, frequency, now + index * 0.09, 0.18, 'triangle', 0.07);
    });
    return;
  }
  if (name === 'lose') {
    [392, 311, 247].forEach((frequency, index) => {
      tone(audio, frequency, now + index * 0.12, 0.2, 'triangle', 0.06);
    });
    return;
  }
  tone(audio, 540, now, 0.06, 'sine', 0.05);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
