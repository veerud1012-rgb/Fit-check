// Web Audio API Synthesizer for Gym Workout Alarms & Rest Timers
import { ReminderSetting } from "../types";

let audioCtx: AudioContext | null = null;
let currentLoopInterval: number | null = null;
let currentCustomAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthSound(
  synthType: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm" | "rest_complete" | "alarm_beep" = "metal_bell",
  volume = 0.8
) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (synthType === "metal_bell") {
      // Heavy Metallic Gong Bell
      const freqs = [220, 440, 880, 1320];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.4 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    } else if (synthType === "gym_horn") {
      // Deep Brassy Dual Sawtooth Gym Horn
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";

      osc1.frequency.setValueAtTime(110, now); // A2
      osc2.frequency.setValueAtTime(164.81, now); // E3

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } else if (synthType === "beep_pulse" || synthType === "alarm_beep") {
      // Triple Pulse Beep
      [0, 0.2, 0.4].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now + delay);

        gain.gain.setValueAtTime(0.5, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } else if (synthType === "synth_drop") {
      // Electronic Bass Drop & Chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.8);
    } else if (synthType === "classic_alarm") {
      // Siren Alarm
      [0, 0.25, 0.5, 0.75].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(750, now + delay);
        osc.frequency.linearRampToValueAtTime(950, now + delay + 0.18);

        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      });
    } else if (synthType === "rest_complete") {
      // Uplifting C Major Chime (C5 - E5 - G5)
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, i) => {
        const delay = i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 1.2);
      });
    }
  } catch (err) {
    console.error("Error playing synth sound:", err);
  }
}

export function startRingtoneAlarm(
  synthType: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm" = "metal_bell",
  volume = 0.8,
  customDataUrl?: string
) {
  stopRingtoneAlarm();

  if (customDataUrl) {
    try {
      currentCustomAudio = new Audio(customDataUrl);
      currentCustomAudio.volume = volume;
      currentCustomAudio.loop = true;
      currentCustomAudio.play().catch((e) => console.warn("Custom audio play blocked:", e));
      return;
    } catch (e) {
      console.error("Custom audio play failed, falling back to synth:", e);
    }
  }

  // Play immediately once
  playSynthSound(synthType, volume);

  // Loop every 2 seconds
  currentLoopInterval = window.setInterval(() => {
    playSynthSound(synthType, volume);
  }, 2000);
}

export function stopRingtoneAlarm() {
  if (currentLoopInterval !== null) {
    clearInterval(currentLoopInterval);
    currentLoopInterval = null;
  }
  if (currentCustomAudio) {
    currentCustomAudio.pause();
    currentCustomAudio.currentTime = 0;
    currentCustomAudio = null;
  }
}

export function stopSynthSound() {
  stopRingtoneAlarm();
}

export function checkWorkoutReminders(reminders: ReminderSetting[], volume: number, vibration: boolean): boolean {
  const now = new Date();
  const currentHoursMins = now.toTimeString().slice(0, 5); // "19:00"

  const matchingReminder = reminders.find((r) => r.enabled && r.time === currentHoursMins);
  if (matchingReminder) {
    startRingtoneAlarm("metal_bell", volume);
    return true;
  }
  return false;
}
