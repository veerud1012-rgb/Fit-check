import {
  UserProfile,
  NotificationPreferences,
  WorkoutPlan,
  ExerciseItem,
  PersonalRecord,
  WorkoutLog,
  BodyMeasurement,
  RingtoneOption,
  AIMessage,
} from "../types";
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_WEEKLY_SCHEDULE,
  DEFAULT_EXERCISES,
  INITIAL_PRS,
  INITIAL_BODY_STATS,
  BUILTIN_RINGTONES,
} from "../data/defaultData";

const STORAGE_KEYS = {
  PROFILE: "fitpulse_profile_v1",
  NOTIF_PREFS: "fitpulse_notif_prefs_v1",
  SCHEDULE: "fitpulse_schedule_v1",
  EXERCISES: "fitpulse_exercises_v1",
  PRS: "fitpulse_prs_v1",
  LOGS: "fitpulse_logs_v1",
  BODY_STATS: "fitpulse_body_stats_v1",
  RINGTONES: "fitpulse_ringtones_v1",
  AI_MESSAGES: "fitpulse_ai_messages_v1",
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading profile:", e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving profile:", e);
  }
}

import {
  saveCustomAudioToIDB,
  loadCustomAudioFromIDB,
  removeCustomAudioFromIDB,
} from "./audioStorage";

export function loadNotifPrefs(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIF_PREFS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up inline base64 if present in old localStorage keys
      if (parsed.customAudioUrl && parsed.customAudioUrl.length > 1000) {
        delete parsed.customAudioUrl;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error loading notification preferences:", e);
  }
  return DEFAULT_NOTIFICATION_PREFS;
}

export function saveNotifPrefs(prefs: NotificationPreferences): void {
  try {
    // Separate heavy audio data URL from metadata to preserve localStorage quota
    const { customAudioUrl, ...metadataPrefs } = prefs;
    
    // Save lightweight metadata to localStorage
    localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(metadataPrefs));

    // Persist audio data to IndexedDB
    if (customAudioUrl) {
      saveCustomAudioToIDB(customAudioUrl).catch((err) => {
        console.warn("Failed to persist custom audio to IndexedDB:", err);
      });
    } else {
      removeCustomAudioFromIDB().catch(() => {});
    }
  } catch (e) {
    console.error("Error saving notification preferences:", e);
  }
}

export function loadWeeklySchedule(): WorkoutPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading schedule:", e);
  }
  return DEFAULT_WEEKLY_SCHEDULE;
}

export function saveWeeklySchedule(schedule: WorkoutPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error("Error saving schedule:", e);
  }
}

export function loadExercises(): ExerciseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading exercises:", e);
  }
  return DEFAULT_EXERCISES;
}

export function saveExercises(exercises: ExerciseItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (e) {
    console.error("Error saving exercises:", e);
  }
}

export function loadPRs(): PersonalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading PRs:", e);
  }
  return INITIAL_PRS;
}

export function savePRs(prs: PersonalRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(prs));
  } catch (e) {
    console.error("Error saving PRs:", e);
  }
}

export function loadWorkoutLogs(): WorkoutLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading workout logs:", e);
  }
  return [];
}

export function saveWorkoutLogs(logs: WorkoutLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Error saving workout logs:", e);
  }
}

export function loadBodyStats(): BodyMeasurement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BODY_STATS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading body stats:", e);
  }
  return INITIAL_BODY_STATS;
}

export function saveBodyStats(stats: BodyMeasurement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BODY_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving body stats:", e);
  }
}

export function loadRingtones(): RingtoneOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RINGTONES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading ringtones:", e);
  }
  return BUILTIN_RINGTONES;
}

export function saveRingtones(ringtones: RingtoneOption[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RINGTONES, JSON.stringify(ringtones));
  } catch (e) {
    console.error("Error saving ringtones:", e);
  }
}

export function loadAIMessages(): AIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading AI messages:", e);
  }
  return [];
}

export function saveAIMessages(messages: AIMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error("Error saving AI messages:", e);
  }
}

// Aliases for compatibility
export const getUserProfile = loadProfile;
export const saveUserProfile = saveProfile;
export const getWorkoutSchedule = loadWeeklySchedule;
export const saveWorkoutSchedule = saveWeeklySchedule;
export const getNotificationPreferences = loadNotifPrefs;
export const saveNotificationPreferences = saveNotifPrefs;
export const getExerciseLibrary = loadExercises;
export const saveCustomExercise = (ex: ExerciseItem) => {
  const current = loadExercises();
  saveExercises([...current, ex]);
};
export const getPersonalRecords = loadPRs;
export const savePersonalRecord = (pr: PersonalRecord) => {
  const current = loadPRs();
  savePRs([...current, pr]);
};
export const getBodyStats = loadBodyStats;
export const saveBodyStat = (st: BodyMeasurement) => {
  const current = loadBodyStats();
  saveBodyStats([...current, st]);
};
export const getWorkoutLogs = loadWorkoutLogs;
export const saveWorkoutLog = (log: WorkoutLog) => {
  const current = loadWorkoutLogs();
  saveWorkoutLogs([...current, log]);
};

export function exportAllData(): string {
  const data = {
    profile: loadProfile(),
    notifPrefs: loadNotifPrefs(),
    schedule: loadWeeklySchedule(),
    exercises: loadExercises(),
    prs: loadPRs(),
    logs: loadWorkoutLogs(),
    bodyStats: loadBodyStats(),
  };
  return JSON.stringify(data, null, 2);
}

export function exportUserDataAsJSON(): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportAllData());
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fitpulse_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importUserDataFromJSON(file: File, callback: () => void): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.profile) saveProfile(parsed.profile);
        if (parsed.notifPrefs) saveNotifPrefs(parsed.notifPrefs);
        if (parsed.schedule) saveWeeklySchedule(parsed.schedule);
        if (parsed.exercises) saveExercises(parsed.exercises);
        if (parsed.prs) savePRs(parsed.prs);
        if (parsed.logs) saveWorkoutLogs(parsed.logs);
        if (parsed.bodyStats) saveBodyStats(parsed.bodyStats);
        callback();
      } catch (err) {
        console.error("Failed to import json file:", err);
      }
    }
  };
  reader.readAsText(file);
}

export function clearAllAppData(): void {
  localStorage.clear();
}
