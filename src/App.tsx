import React, { useState, useEffect } from "react";
import {
  getUserProfile,
  saveUserProfile,
  getWorkoutSchedule,
  saveWorkoutSchedule,
  getNotificationPreferences,
  saveNotificationPreferences,
  getExerciseLibrary,
  saveCustomExercise,
  getPersonalRecords,
  savePersonalRecord,
  getBodyStats,
  saveBodyStat,
  getWorkoutLogs,
  saveWorkoutLog,
  clearAllAppData,
} from "./utils/storage";

import {
  AppTab,
  UserProfile,
  WorkoutPlan,
  NotificationPreferences,
  ExerciseItem,
  PersonalRecord,
  BodyMeasurement,
  WorkoutLog,
  DayOfWeek,
} from "./types";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/DashboardView";
import { WorkoutModeView } from "./components/WorkoutModeView";
import { WorkoutsBuilderView } from "./components/WorkoutsBuilderView";
import { ExerciseLibraryView } from "./components/ExerciseLibraryView";
import { TimersView } from "./components/TimersView";
import { ProgressView } from "./components/ProgressView";
import { PersonalRecordsView } from "./components/PersonalRecordsView";
import { CalendarView } from "./components/CalendarView";
import { AIAssistantView } from "./components/AIAssistantView";
import { RemindersSettingsView } from "./components/RemindersSettingsView";
import { SettingsView } from "./components/SettingsView";
import { OnboardingModal } from "./components/OnboardingModal";
import { MissedWorkoutModal } from "./components/MissedWorkoutModal";
import { StartWorkoutModal } from "./components/StartWorkoutModal";

import { Volume2, Square, BellRing } from "lucide-react";
import { checkWorkoutReminders, playSynthSound, stopSynthSound, subscribeAudioState } from "./utils/audioSynth";
import { triggerDeviceVibration } from "./utils/notifications";
import { loadCustomAudioFromIDB } from "./utils/audioStorage";

export const App: React.FC = () => {
  // App state
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [schedule, setSchedule] = useState<WorkoutPlan[]>(getWorkoutSchedule());
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseItem[]>(getExerciseLibrary());
  const [prs, setPRs] = useState<PersonalRecord[]>(getPersonalRecords());
  const [bodyStats, setBodyStats] = useState<BodyMeasurement[]>(getBodyStats());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(getWorkoutLogs());

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [showStartWorkoutModal, setShowStartWorkoutModal] = useState(false);
  const [sessionCustomRestSec, setSessionCustomRestSec] = useState<number | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [missedWorkoutPlan, setMissedWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Subscribe to global audio state
  useEffect(() => {
    const unsubscribe = subscribeAudioState((active) => {
      setIsAudioActive(active);
    });
    return () => unsubscribe();
  }, []);

  // Stop alarm helper that also automatically deselects/disables active scheduled reminders
  const handleStopAlarmSound = () => {
    stopSynthSound();
    setIsAlarmRinging(false);
    const currentHHMM = new Date().toTimeString().slice(0, 5);
    setNotifPrefs((prev) => {
      let changed = false;
      const updatedReminders = prev.reminders.map((r) => {
        if (r.enabled && r.time === currentHHMM) {
          changed = true;
          return { ...r, enabled: false };
        }
        return r;
      });
      if (changed) {
        const updated = { ...prev, reminders: updatedReminders };
        saveNotificationPreferences(updated);
        return updated;
      }
      return prev;
    });
  };

  // Load custom audio from IndexedDB on startup
  useEffect(() => {
    loadCustomAudioFromIDB().then((customAudioUrl) => {
      if (customAudioUrl) {
        setNotifPrefs((prev) => ({
          ...prev,
          customAudioUrl,
        }));
      }
    });
  }, []);

  // Check onboarding
  useEffect(() => {
    const rawProfile = localStorage.getItem("fitpulse_profile");
    if (!rawProfile) {
      setShowOnboarding(true);
    }
  }, []);

  // Periodic alarm reminder background check loop
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const triggeredId = checkWorkoutReminders(
        notifPrefs.reminders,
        notifPrefs.alarmVolume,
        notifPrefs.vibrationEnabled,
        notifPrefs.selectedRingtone === "custom" || notifPrefs.customAudioUrl ? notifPrefs.customAudioUrl : undefined
      );
      if (triggeredId) {
        setIsAlarmRinging(true);
        triggerDeviceVibration([400, 200, 400, 200, 600]);
        // Automatically deselect / disable the triggered scheduled alarm so it turns off and doesn't repeat
        setNotifPrefs((prev) => {
          const updatedReminders = prev.reminders.map((r) =>
            r.id === triggeredId ? { ...r, enabled: false } : r
          );
          const updated = { ...prev, reminders: updatedReminders };
          saveNotificationPreferences(updated);
          return updated;
        });
      }
    }, 15000); // Check every 15s

    return () => clearInterval(reminderInterval);
  }, [notifPrefs]);

  // Determine Today's Workout Plan
  const daysOfWeek: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayDayName = daysOfWeek[new Date().getDay()];
  const todayPlan =
    schedule.find((p) => p.day === todayDayName) || schedule[0];

  // Save Schedule updates
  const handleSaveSchedule = (newSchedule: WorkoutPlan[]) => {
    setSchedule(newSchedule);
    saveWorkoutSchedule(newSchedule);
  };

  // Save Profile updates
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  // Save Notification Preferences
  const handleSaveNotifPrefs = (newPrefs: NotificationPreferences) => {
    setNotifPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

  // Save Custom Exercise
  const handleAddCustomExercise = (ex: ExerciseItem) => {
    saveCustomExercise(ex);
    setExerciseLibrary(getExerciseLibrary());
  };

  // Save PR
  const handleAddPR = (pr: PersonalRecord) => {
    savePersonalRecord(pr);
    setPRs(getPersonalRecords());
  };

  // Save Body Measurement
  const handleAddBodyStat = (stat: BodyMeasurement) => {
    saveBodyStat(stat);
    setBodyStats(getBodyStats());
  };

  // Complete set toggle in Dashboard
  const handleToggleExerciseSetInDashboard = (exerciseId: string, setId: string) => {
    const updatedExercises = todayPlan.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s));
      return { ...ex, sets: updatedSets };
    });

    const updatedSchedule = schedule.map((p) =>
      p.day === todayDayName ? { ...p, exercises: updatedExercises } : p
    );
    handleSaveSchedule(updatedSchedule);
  };

  // Add exercise directly to today's workout
  const handleAddExerciseToToday = (exercise: ExerciseItem) => {
    const newEx = {
      id: `ex_today_${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      setsCount: exercise.defaultSets,
      targetReps: typeof exercise.defaultReps === "number" ? exercise.defaultReps.toString() : exercise.defaultReps,
      weightKg: 20,
      restSec: exercise.defaultRestSec,
      imageUrl: exercise.imageUrl,
      sets: Array.from({ length: exercise.defaultSets }, (_, i) => ({
        id: `s_${Date.now()}_${i}`,
        setNumber: i + 1,
        weightKg: 20,
        reps: 10,
        completed: false,
      })),
    };

    const updatedExercises = [...todayPlan.exercises, newEx];
    const updatedSchedule = schedule.map((p) =>
      p.day === todayDayName ? { ...p, exercises: updatedExercises } : p
    );
    handleSaveSchedule(updatedSchedule);
  };

  // Finish Workout Session
  const handleFinishWorkout = (completedPlan: WorkoutPlan, durationMin: number, volumeKg: number) => {
    const newLog: WorkoutLog = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      dayName: todayDayName,
      workoutName: completedPlan.workoutName,
      durationMinutes: durationMin,
      totalVolumeKg: volumeKg,
      completedExercises: completedPlan.exercises,
    };

    saveWorkoutLog(newLog);
    setWorkoutLogs(getWorkoutLogs());

    // Increase streak & total workouts
    const updatedProf: UserProfile = {
      ...profile,
      streakDays: profile.streakDays + 1,
      totalWorkouts: profile.totalWorkouts + 1,
    };
    handleSaveProfile(updatedProf);

    setIsWorkoutMode(false);
    setActiveTab("dashboard");
  };

  // Reset to Defaults
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all workout data to defaults?")) {
      clearAllAppData();
      window.location.reload();
    }
  };

  // Render Active Tab Component
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            todayPlan={todayPlan}
            profile={profile}
            notifPrefs={notifPrefs}
            prs={prs}
            onStartWorkout={() => setShowStartWorkoutModal(true)}
            onToggleExerciseSet={handleToggleExerciseSetInDashboard}
            onOpenWorkoutsBuilder={() => setActiveTab("workouts")}
            onOpenTimers={() => setActiveTab("timers")}
            onOpenReminders={() => setActiveTab("reminders")}
            onOpenProgress={() => setActiveTab("progress")}
            onOpenAI={() => setActiveTab("ai")}
            onOpenLibrary={() => setActiveTab("library")}
          />
        );
      case "workouts":
        return (
          <WorkoutsBuilderView
            schedule={schedule}
            exerciseLibrary={exerciseLibrary}
            onSaveSchedule={handleSaveSchedule}
            onOpenLibrary={() => setActiveTab("library")}
          />
        );
      case "library":
        return (
          <ExerciseLibraryView
            exercises={exerciseLibrary}
            prs={prs}
            onAddCustomExercise={handleAddCustomExercise}
            onAddExerciseToToday={handleAddExerciseToToday}
            onAddNewPR={handleAddPR}
          />
        );
      case "timers":
        return <TimersView notifPrefs={notifPrefs} />;
      case "progress":
        return (
          <ProgressView
            profile={profile}
            workoutLogs={workoutLogs}
            bodyStats={bodyStats}
            onAddBodyStat={handleAddBodyStat}
          />
        );
      case "prs":
        return (
          <PersonalRecordsView
            prs={prs}
            exerciseLibrary={exerciseLibrary}
            onAddNewPR={handleAddPR}
          />
        );
      case "calendar":
        return (
          <CalendarView
            schedule={schedule}
            workoutLogs={workoutLogs}
            onStartWorkout={() => setShowStartWorkoutModal(true)}
          />
        );
      case "ai":
        return <AIAssistantView profile={profile} todayPlan={todayPlan} />;
      case "reminders":
        return (
          <RemindersSettingsView
            notifPrefs={notifPrefs}
            onSavePrefs={handleSaveNotifPrefs}
          />
        );
      case "settings":
        return (
          <SettingsView
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onResetData={handleResetData}
          />
        );
      default:
        return null;
    }
  };

  // If Workout Mode is active, render Workout Mode screen directly
  if (isWorkoutMode) {
    return (
      <div className="relative">
        {(isAudioActive || isAlarmRinging) && (
          <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-2xl flex items-center justify-between gap-3 border-b-2 border-white/20 animate-pulse">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-black/30 rounded-xl flex-shrink-0">
                <Volume2 className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-200">
                  🔔 ALARM SOUND IS PLAYING
                </div>
                <p className="text-[11px] text-white/90 truncate">
                  Tap button to immediately stop and silence the alarm audio.
                </p>
              </div>
            </div>

            <button
              onClick={handleStopAlarmSound}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition flex-shrink-0 cursor-pointer border border-black/20"
              id="workout-stop-sound-btn"
            >
              <Square className="w-4 h-4 fill-black" />
              <span>STOP ALARM</span>
            </button>
          </div>
        )}
        <WorkoutModeView
          workoutPlan={todayPlan}
          prs={prs}
          onFinishWorkout={handleFinishWorkout}
          onExitWorkout={() => setIsWorkoutMode(false)}
          onAddNewPR={handleAddPR}
          notifPrefs={notifPrefs}
          customRestSec={sessionCustomRestSec}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans selection:bg-lime-400 selection:text-black relative">
      {/* Universal Floating Stop Sound/Alarm Banner (Shows whenever audio is playing on desktop or mobile) */}
      {(isAudioActive || isAlarmRinging) && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-2xl flex items-center justify-between gap-3 border-b-2 border-white/20 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-black/30 rounded-xl flex-shrink-0">
              <Volume2 className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-200 flex items-center gap-2">
                <span>🔔 ALARM SOUND IS PLAYING</span>
              </div>
              <p className="text-[11px] text-white/90 truncate">
                Tap button to immediately stop and silence the alarm audio.
              </p>
            </div>
          </div>

          <button
            onClick={handleStopAlarmSound}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition flex-shrink-0 cursor-pointer border border-black/20"
            id="global-stop-sound-btn"
          >
            <Square className="w-4 h-4 fill-black" />
            <span>STOP ALARM</span>
          </button>
        </div>
      )}

      {/* Start Workout Session Dialogue Box Modal */}
      {showStartWorkoutModal && (
        <StartWorkoutModal
          workoutPlan={todayPlan}
          onConfirmStart={(customRestSec) => {
            setSessionCustomRestSec(customRestSec);
            setShowStartWorkoutModal(false);
            setIsWorkoutMode(true);
          }}
          onClose={() => setShowStartWorkoutModal(false)}
        />
      )}

      {/* Onboarding Welcome Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={(newProf) => {
            handleSaveProfile(newProf);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Missed Workout Handler Modal */}
      {missedWorkoutPlan && (
        <MissedWorkoutModal
          missedPlan={missedWorkoutPlan}
          onMoveToToday={() => {
            const updated = schedule.map((p) =>
              p.day === todayDayName ? { ...p, exercises: missedWorkoutPlan.exercises, workoutName: missedWorkoutPlan.workoutName } : p
            );
            handleSaveSchedule(updated);
            setMissedWorkoutPlan(null);
          }}
          onSkipMissed={() => setMissedWorkoutPlan(null)}
          onRescheduleToRestDay={() => {
            const updated = schedule.map((p) =>
              p.day === "Sunday" ? { ...p, exercises: missedWorkoutPlan.exercises, workoutName: missedWorkoutPlan.workoutName, isRestDay: false } : p
            );
            handleSaveSchedule(updated);
            setMissedWorkoutPlan(null);
          }}
          onClose={() => setMissedWorkoutPlan(null)}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header
            profile={profile}
            notifPrefs={notifPrefs}
            onStartWorkout={() => setShowStartWorkoutModal(true)}
            onOpenReminders={() => setActiveTab("reminders")}
            onOpenAI={() => setActiveTab("ai")}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            activeAlarmPlaying={isAlarmRinging}
            onStopAlarm={handleStopAlarmSound}
          />

          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Mobile Touch Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartWorkout={() => setShowStartWorkoutModal(true)}
      />
    </div>
  );
};

export default App;
