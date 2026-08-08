import { startRingtoneAlarm } from "./audioSynth";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function triggerDeviceVibration(pattern: number[] = [300, 100, 300, 100, 500]) {
  if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Vibration failed:", e);
    }
  }
}

export function triggerWorkoutNotification(
  workoutName: string,
  ringtoneSynthType: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm" = "metal_bell",
  volume = 0.8,
  customDataUrl?: string,
  vibrationEnabled = true
) {
  const title = `🔥 It's ${workoutName} Day!`;
  const body = "Your gym workout is waiting for you. Let's crush your goals today!";

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
      });
    } catch (err) {
      console.warn("Failed to create browser notification:", err);
    }
  }

  if (vibrationEnabled) {
    triggerDeviceVibration([500, 200, 500, 200, 1000]);
  }

  startRingtoneAlarm(ringtoneSynthType, volume, customDataUrl);
}
