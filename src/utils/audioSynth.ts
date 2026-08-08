// Web Audio API Synthesizer for Gym Workout Alarms & Rest Timers
import { ReminderSetting, NotificationPreferences } from "../types";
import { loadCustomAudioFromIDB } from "./audioStorage";

let audioCtx: AudioContext | null = null;
let currentLoopInterval: number | null = null;
let currentCustomAudio: HTMLAudioElement | null = null;
let isAudioActive = false;

type AudioStateListener = (active: boolean) => void;
const audioStateListeners: Set<AudioStateListener> = new Set();

export function subscribeAudioState(listener: AudioStateListener) {
  audioStateListeners.add(listener);
  listener(isAudioActive);
  return () => {
    audioStateListeners.delete(listener);
  };
}

function notifyAudioState(active: boolean) {
  isAudioActive = active;
  audioStateListeners.forEach((fn) => fn(active));
}

export function isAudioCurrentlyPlaying(): boolean {
  return isAudioActive;
}

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

export function playCustomAudio(
  dataUrl: string,
  volume = 0.8,
  loop = false,
  onEnded?: () => void
): HTMLAudioElement | null {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  try {
    stopCustomAudio();
    currentCustomAudio = new Audio(dataUrl);
    currentCustomAudio.volume = volume;
    currentCustomAudio.loop = loop;
    currentCustomAudio.onerror = () => {
      console.warn("Custom audio could not be played or format is unsupported.");
      stopCustomAudio();
    };
    
    currentCustomAudio.onended = () => {
      notifyAudioState(false);
      if (onEnded) onEnded();
    };

    const playPromise = currentCustomAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          notifyAudioState(true);
        })
        .catch((e) => {
          console.warn("Custom audio playback error/blocked:", e);
          notifyAudioState(false);
        });
    }
    return currentCustomAudio;
  } catch (err) {
    console.warn("Failed to initialize custom audio:", err);
    notifyAudioState(false);
    return null;
  }
}

export function stopCustomAudio() {
  if (currentCustomAudio) {
    try {
      currentCustomAudio.pause();
      currentCustomAudio.currentTime = 0;
    } catch (e) {
      console.warn("Error stopping custom audio:", e);
    }
    currentCustomAudio = null;
  }
  notifyAudioState(false);
}

export function startRingtoneAlarm(
  synthType: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm" = "metal_bell",
  volume = 0.8,
  customDataUrl?: string
) {
  stopRingtoneAlarm();

  if (customDataUrl) {
    const audio = playCustomAudio(customDataUrl, volume, true);
    if (audio) {
      notifyAudioState(true);
      return;
    }
  }

  notifyAudioState(true);

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
  stopCustomAudio();
  notifyAudioState(false);
}

export function stopSynthSound() {
  stopRingtoneAlarm();
}

/**
 * Plays the user's uploaded custom audio track or their chosen preset ringtone from preferences
 */
export function playRingtoneFromPrefs(
  notifPrefs?: NotificationPreferences | null,
  fallbackSynth: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm" | "rest_complete" | "alarm_beep" = "rest_complete"
) {
  if (!notifPrefs) {
    try {
      const raw = localStorage.getItem("fitpulse_notif_prefs_v1");
      if (raw) {
        notifPrefs = JSON.parse(raw);
      }
    } catch (e) {
      // ignore
    }
  }

  const volume = typeof notifPrefs?.alarmVolume === "number" ? notifPrefs.alarmVolume : 0.8;
  const selectedRingtone = notifPrefs?.selectedRingtone;
  const customUrl = notifPrefs?.customAudioUrl;

  // Check if custom audio is selected or available
  if (selectedRingtone === "custom" || customUrl) {
    if (customUrl) {
      const audio = playCustomAudio(customUrl, volume, false);
      if (audio) return;
    } else {
      // Async fallback to IndexedDB if custom URL was not yet loaded in state
      loadCustomAudioFromIDB()
        .then((idbUrl) => {
          if (idbUrl) {
            playCustomAudio(idbUrl, volume, false);
          } else {
            playSynthSound(fallbackSynth, volume);
          }
        })
        .catch(() => {
          playSynthSound(fallbackSynth, volume);
        });
      return;
    }
  }

  // Preset ringtone mapping
  const presetMap: Record<string, "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm"> = {
    heavy_metal: "gym_horn",
    motivational_chime: "metal_bell",
    techno_alarm: "synth_drop",
    subtle_beep: "beep_pulse",
  };

  const synthType = (selectedRingtone && presetMap[selectedRingtone]) || fallbackSynth;
  playSynthSound(synthType, volume);
}

export function checkWorkoutReminders(
  reminders: ReminderSetting[],
  volume: number,
  vibration: boolean,
  customDataUrl?: string,
  selectedRingtone?: string
): string | null {
  const now = new Date();
  const currentHoursMins = now.toTimeString().slice(0, 5); // "19:00"

  const matchingReminder = reminders?.find((r) => r.enabled && r.time === currentHoursMins);
  if (matchingReminder) {
    const presetMap: Record<string, "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm"> = {
      heavy_metal: "gym_horn",
      motivational_chime: "metal_bell",
      techno_alarm: "synth_drop",
      subtle_beep: "beep_pulse",
    };
    const synthType = (selectedRingtone && presetMap[selectedRingtone]) || "metal_bell";
    startRingtoneAlarm(synthType, volume, customDataUrl);
    return matchingReminder.id;
  }
  return null;
}
