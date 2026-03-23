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

let bgmAudio: HTMLAudioElement | null = null;
export let isPlayingBgm = false;

export const toggleBgm = () => {
  if (!bgmAudio) {
    // Using "Sneaky Snitch" by Kevin MacLeod (Royalty-Free / CC-BY)
    // Hosted on Internet Archive for reliable cross-browser MP3 streaming
    bgmAudio = new Audio('https://archive.org/download/KevinMacLeod-SneakySnitch/Kevin%20MacLeod%20-%20Sneaky%20Snitch.mp3');
    bgmAudio.crossOrigin = "anonymous";
    bgmAudio.loop = true;
    bgmAudio.volume = 0.3;
  }
  
  if (isPlayingBgm) {
    bgmAudio.pause();
    isPlayingBgm = false;
  } else {
    bgmAudio.play().catch(e => console.error("Audio play failed:", e));
    isPlayingBgm = true;
  }
};
