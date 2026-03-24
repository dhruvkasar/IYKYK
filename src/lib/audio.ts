const getAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
};

let ctx: AudioContext | null = null;

export const initAudio = () => {
  if (!ctx) {
    ctx = getAudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

export const playCorrect = () => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  osc.start(now);
  osc.stop(now + 0.5);
};

export const playWrong = () => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  osc.start(now);
  osc.stop(now + 0.4);
};

export const playHint = () => {
  if (!ctx) return;
  const now = ctx.currentTime;
  
  [1200, 1600, 2400].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const startTime = now + i * 0.1;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
};

let bgmTimerID: number | null = null;
let nextNoteTime = 0;
let currentNote = 0;
export let isPlayingBgm = false;

// Mysterious 8-bit arpeggio (A minor)
const bgmNotes = [
  220.00, 261.63, 329.63, 440.00,
  392.00, 329.63, 261.63, 246.94,
  220.00, 261.63, 329.63, 440.00,
  493.88, 440.00, 329.63, 261.63
];

const scheduleNote = (freq: number, time: number) => {
  if (!ctx || freq === 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // 'square' gives it that retro 8-bit sound
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.value = freq;
  
  // Envelope to make it sound plucky
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.03, time + 0.02); // Low volume
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  
  osc.start(time);
  osc.stop(time + 0.15);
};

const scheduler = () => {
  if (!ctx || !isPlayingBgm) return;
  
  // Schedule notes slightly ahead of time
  while (nextNoteTime < ctx.currentTime + 0.1) {
    scheduleNote(bgmNotes[currentNote], nextNoteTime);
    nextNoteTime += 0.2; // Speed of the arpeggio (lower is faster)
    currentNote = (currentNote + 1) % bgmNotes.length;
  }
  
  bgmTimerID = window.setTimeout(scheduler, 25.0);
};

export const toggleBgm = async (): Promise<boolean> => {
  if (!ctx) {
    initAudio();
  }
  
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  if (isPlayingBgm) {
    isPlayingBgm = false;
    if (bgmTimerID !== null) {
      window.clearTimeout(bgmTimerID);
      bgmTimerID = null;
    }
    return false;
  } else {
    isPlayingBgm = true;
    if (ctx) {
      nextNoteTime = ctx.currentTime + 0.05;
      currentNote = 0;
      scheduler();
    }
    return true;
  }
};
