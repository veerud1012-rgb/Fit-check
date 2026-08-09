import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Trophy,
  Flame,
  Volume2,
  Sparkles,
  Clock,
  Plus,
  Minus,
  Dumbbell,
  Square,
} from "lucide-react";
import confetti from "canvas-confetti";
import { WorkoutPlan, WorkoutExercise, SetData, PersonalRecord, NotificationPreferences } from "../types";
import { playRingtoneFromPrefs, stopSynthSound } from "../utils/audioSynth";
import { triggerDeviceVibration } from "../utils/notifications";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { getWorkoutImage } from "../utils/workoutImages";
import { ExerciseItem } from "../types";

interface WorkoutModeViewProps {
  workoutPlan: WorkoutPlan;
  prs: PersonalRecord[];
  onFinishWorkout: (completedPlan: WorkoutPlan, durationMin: number, volumeKg: number) => void;
  onExitWorkout: () => void;
  onAddNewPR?: (pr: PersonalRecord) => void;
  notifPrefs?: NotificationPreferences;
  customRestSec?: number;
}

export const WorkoutModeView: React.FC<WorkoutModeViewProps> = ({
  workoutPlan,
  prs,
  onFinishWorkout,
  onExitWorkout,
  onAddNewPR,
  notifPrefs,
  customRestSec,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercisesState, setExercisesState] = useState<WorkoutExercise[]>(
    JSON.parse(JSON.stringify(workoutPlan.exercises))
  );

  // Timer states
  const [restTimeSec, setRestTimeSec] = useState(0);
  const [restTimerInitial, setRestTimerInitial] = useState(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [elapsedWorkoutSec, setElapsedWorkoutSec] = useState(0);

  // PR Celebration Modal
  const [newPRModal, setNewPRModal] = useState<PersonalRecord | null>(null);

  // Session Summary Modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Exercise Detail Slide-Up Modal
  const [detailModalExercise, setDetailModalExercise] = useState<ExerciseItem | null>(null);

  const currentExercise = exercisesState[currentExerciseIndex] || exercisesState[0];

  // Overall workout stopwatch interval
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedWorkoutSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest Timer interval
  useEffect(() => {
    let timer: number | null = null;
    if (isRestTimerActive && restTimeSec > 0) {
      timer = window.setInterval(() => {
        setRestTimeSec((prev) => prev - 1);
      }, 1000);
    } else if (isRestTimerActive && restTimeSec === 0) {
      setIsRestTimerActive(false);
      playRingtoneFromPrefs(notifPrefs, "rest_complete");
      triggerDeviceVibration([200, 100, 200]);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRestTimerActive, restTimeSec]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUpdateSetWeight = (setId: string, delta: number) => {
    setExercisesState((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, weightKg: Math.max(0, s.weightKg + delta) } : s)),
        };
      })
    );
  };

  const handleUpdateSetReps = (setId: string, delta: number) => {
    setExercisesState((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, reps: Math.max(1, s.reps + delta) } : s)),
        };
      })
    );
  };

  const handleToggleSet = (setId: string) => {
    let justCompletedSet: SetData | null = null;

    setExercisesState((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== currentExerciseIndex) return ex;
        const updatedSets = ex.sets.map((s) => {
          if (s.id === setId) {
            const nextCompleted = !s.completed;
            if (nextCompleted) justCompletedSet = s;
            return { ...s, completed: nextCompleted };
          }
          return s;
        });
        return { ...ex, sets: updatedSets };
      })
    );

    // If set was just completed, trigger rest timer & PR check
    if (justCompletedSet) {
      const setObj = justCompletedSet as SetData;
      // PR Check
      const existingPR = prs.find(
        (p) => p.exerciseName.toLowerCase() === currentExercise.name.toLowerCase()
      );
      if (!existingPR || setObj.weightKg > existingPR.maxWeightKg) {
        const newRecord: PersonalRecord = {
          id: `pr_${Date.now()}`,
          exerciseId: currentExercise.exerciseId,
          exerciseName: currentExercise.name,
          targetMuscle: currentExercise.targetMuscle,
          maxWeightKg: setObj.weightKg,
          maxRepsAtMaxWeight: setObj.reps,
          bestSetVolumeKg: setObj.weightKg * setObj.reps,
          dateAchieved: new Date().toISOString().split("T")[0],
        };
        setNewPRModal(newRecord);
        if (onAddNewPR) onAddNewPR(newRecord);

        // Confetti burst for PR!
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      // Auto start rest timer
      const rest = customRestSec || currentExercise.restSec || 90;
      setRestTimeSec(rest);
      setRestTimerInitial(rest);
      setIsRestTimerActive(true);
    }
  };

  const handleNextExercise = () => {
    setIsRestTimerActive(false);
    if (currentExerciseIndex < exercisesState.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      triggerSessionFinish();
    }
  };

  const handlePrevExercise = () => {
    setIsRestTimerActive(false);
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const triggerSessionFinish = () => {
    setIsRestTimerActive(false);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    setShowSummaryModal(true);
  };

  // Calculate volume
  let totalVolume = 0;
  let totalCompletedSets = 0;
  exercisesState.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed) {
        totalVolume += s.weightKg * s.reps;
        totalCompletedSets++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white p-4 max-w-2xl mx-auto space-y-5 pb-24">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <button
          onClick={onExitWorkout}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-extrabold text-lime-400 uppercase tracking-widest">
            WORKOUT MODE • {workoutPlan.workoutName}
          </span>
          <div className="text-sm font-bold text-zinc-300">
            Elapsed: <span className="text-white font-mono">{formatTime(elapsedWorkoutSec)}</span>
          </div>
        </div>

        <button
          onClick={triggerSessionFinish}
          className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow transition"
        >
          FINISH
        </button>
      </div>

      {/* Exercise Navigation Dots */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 custom-scrollbar">
        {exercisesState.map((ex, idx) => {
          const isDone = ex.sets.every((s) => s.completed);
          const isCurrent = idx === currentExerciseIndex;
          return (
            <button
              key={ex.id}
              onClick={() => setCurrentExerciseIndex(idx)}
              className={`flex-1 min-w-[32px] py-1.5 rounded-lg text-xs font-bold transition text-center ${
                isCurrent
                  ? "bg-lime-400 text-black ring-2 ring-lime-300"
                  : isDone
                  ? "bg-lime-950 text-lime-400 border border-lime-500/30"
                  : "bg-zinc-900 text-zinc-500 border border-white/5"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Active Exercise View - Matching Screen 2 */}
      <div className="space-y-4">
        {/* Exercise Subheader & Info */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-lime-400">
              Exercise {currentExerciseIndex + 1} of {exercisesState.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{currentExercise.name}</span>
              <button
                onClick={() => {
                  setDetailModalExercise({
                    id: currentExercise.id,
                    name: currentExercise.name,
                    targetMuscle: currentExercise.targetMuscle,
                    equipment: "Dumbbell",
                    difficulty: "Intermediate",
                    defaultSets: currentExercise.setsCount,
                    defaultReps: currentExercise.targetReps,
                    defaultRestSec: currentExercise.restSec,
                    instructions: "Set bench to 30° incline. Drive dumbbells up with elbows at 45°.",
                    safetyTips: "Control descent, keep shoulder blades retracted.",
                    imageUrl: currentExercise.imageUrl,
                  });
                }}
                className="text-zinc-500 hover:text-white p-1"
              >
                ⓘ
              </button>
            </h2>
          </div>
        </div>

        {/* Dual Illustration Box: Exercise Image + Targeted Muscle Diagram */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-3xl bg-[#12141c] border border-white/10">
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 aspect-video flex items-center justify-center">
            {currentExercise.imageUrl ? (
              <img
                src={currentExercise.imageUrl}
                alt={currentExercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Dumbbell className="w-10 h-10 text-lime-400" />
            )}
            <span className="absolute bottom-2 left-2 text-[10px] font-black bg-black/70 px-2 py-0.5 rounded-md text-lime-400">
              EXECUTION
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 p-2 overflow-hidden">
            <img
              src={getWorkoutImage(currentExercise.targetMuscle, [currentExercise.targetMuscle, ...currentExercise.secondaryMuscles])}
              alt={currentExercise.targetMuscle}
              className="w-20 h-20 object-cover rounded-xl border border-lime-400/20"
            />
            <span className="text-[10px] font-black text-lime-400 uppercase mt-1 text-center">
              TARGET: {currentExercise.targetMuscle}
            </span>
          </div>
        </div>

        {/* Set Table */}
        <div className="p-4 rounded-3xl bg-[#12141c] border border-white/10 space-y-3">
          <div className="grid grid-cols-4 text-center text-xs font-black text-zinc-400 pb-2 border-b border-white/5">
            <span>Set</span>
            <span>Weight (kg)</span>
            <span>Reps</span>
            <span>Status</span>
          </div>

          <div className="space-y-2">
            {currentExercise.sets.map((set, idx) => {
              const isActiveSet = !set.completed && (idx === 0 || currentExercise.sets[idx - 1]?.completed);

              return (
                <div
                  key={set.id}
                  className={`grid grid-cols-4 items-center text-center p-3 rounded-2xl border transition ${
                    set.completed
                      ? "bg-zinc-950/60 border-lime-500/20 text-zinc-400"
                      : isActiveSet
                      ? "bg-zinc-900 border-lime-400 ring-1 ring-lime-400 text-white"
                      : "bg-zinc-900/60 border-white/5 text-zinc-300"
                  }`}
                >
                  <span className="font-black text-sm text-zinc-300">#{set.setNumber}</span>

                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleUpdateSetWeight(set.id, -2.5)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-black text-sm text-white w-10">
                      {set.weightKg}
                    </span>
                    <button
                      onClick={() => handleUpdateSetWeight(set.id, 2.5)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleUpdateSetReps(set.id, -1)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-black text-sm text-white w-8">
                      {set.reps}
                    </span>
                    <button
                      onClick={() => handleUpdateSetReps(set.id, 1)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleToggleSet(set.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        set.completed
                          ? "bg-lime-400 text-black shadow-md shadow-lime-400/20"
                          : "border-2 border-zinc-700 hover:border-lime-400 text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Timer Card */}
        <div className="p-4 rounded-3xl bg-[#12141c] border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 flex items-center gap-1.5 uppercase font-black tracking-wider">
              <Clock className="w-4 h-4 text-lime-400" />
              Workout Timer
            </span>
            {isRestTimerActive && (
              <span className="text-lime-400 font-extrabold animate-pulse">Timer Active...</span>
            )}
          </div>

          {/* Digital Timer Clock Display & Play/Pause */}
          <div className="flex items-center justify-between px-2 bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
            <div>
              <div className="text-4xl font-black font-mono text-lime-400 tracking-wider">
                {formatTime(restTimeSec)}
              </div>
              <span className="text-[10px] text-zinc-500 font-semibold">Remaining time</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRestTimerActive(!isRestTimerActive)}
                className="p-3.5 bg-lime-400 text-black rounded-2xl shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition cursor-pointer flex items-center gap-2 font-black text-xs"
              >
                {isRestTimerActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-black" />
                    <span className="hidden sm:inline">PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-black" />
                    <span className="hidden sm:inline">START</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setRestTimeSec(0);
                  setIsRestTimerActive(false);
                }}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                SKIP
              </button>
            </div>
          </div>

          {restTimeSec === 0 && (
            <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 animate-pulse">
              <span className="text-xs font-black text-red-300 uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-yellow-300 animate-bounce" />
                <span>Timer Finished! Alarm Playing</span>
              </span>
              <button
                onClick={() => stopSynthSound()}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>STOP ALARM</span>
              </button>
            </div>
          )}

          {/* Presets Row */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Presets</span>
            <div className="grid grid-cols-5 gap-1.5 text-xs font-extrabold">
              {[30, 60, 90, 120, 180].map((presetSec) => (
                <button
                  key={presetSec}
                  onClick={() => {
                    setRestTimeSec(presetSec);
                    setIsRestTimerActive(true);
                  }}
                  className={`py-2 rounded-xl border transition cursor-pointer ${
                    restTimeSec === presetSec
                      ? "bg-lime-400 text-black border-lime-400 font-black shadow-md shadow-lime-400/20"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/5"
                  }`}
                >
                  {presetSec}s
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration Adjuster (-15s / Exact Seconds / +15s) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Custom Adjustment</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestTimeSec((p) => Math.max(0, p - 15))}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl border border-white/10 font-black text-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Minus className="w-3.5 h-3.5 text-lime-400" />
                <span>-15s</span>
              </button>

              <div className="flex-1 bg-zinc-950 border border-lime-400/30 rounded-xl px-3 py-1.5 flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={restTimeSec}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setRestTimeSec(Math.max(0, val));
                  }}
                  className="w-14 bg-transparent text-center font-mono font-black text-lime-400 text-base focus:outline-none"
                  min="0"
                  max="3600"
                />
                <span className="text-xs font-bold text-zinc-500">sec</span>
              </div>

              <button
                onClick={() => setRestTimeSec((p) => p + 15)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl border border-white/10 font-black text-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-lime-400" />
                <span>+15s</span>
              </button>
            </div>
          </div>

          {/* Quick Add Buttons & Reset */}
          <div className="grid grid-cols-4 gap-2 text-xs font-extrabold pt-1">
            <button
              onClick={() => setRestTimeSec((p) => p + 10)}
              className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/5 cursor-pointer"
            >
              +10s
            </button>
            <button
              onClick={() => setRestTimeSec((p) => p + 30)}
              className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/5 cursor-pointer"
            >
              +30s
            </button>
            <button
              onClick={() => setRestTimeSec((p) => p + 60)}
              className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/5 cursor-pointer"
            >
              +60s
            </button>
            <button
              onClick={() => {
                setRestTimeSec(customRestSec || currentExercise.restSec || 90);
                setIsRestTimerActive(true);
              }}
              className="py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded-xl border border-white/5 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Progressive Overload Box */}
        <div className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between text-xs font-bold text-zinc-400">
          <div>
            Last Time: <span className="text-white">22.5 kg x 10 Reps</span>
          </div>
          <div className="text-lime-400 font-extrabold">
            Suggested: <span className="text-lime-300">25 kg x 8-10</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              const activeSet = currentExercise.sets.find((s) => !s.completed);
              if (activeSet) {
                handleToggleSet(activeSet.id);
              } else {
                handleNextExercise();
              }
            }}
            className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-black font-black text-sm rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <CheckCircle2 className="w-5 h-5 fill-black" />
            <span>COMPLETE SET</span>
          </button>

          <button
            onClick={handleNextExercise}
            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>NEXT EXERCISE</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>



      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrevExercise}
          disabled={currentExerciseIndex === 0}
          className="flex-1 py-4 bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-40 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>PREV EXERCISE</span>
        </button>

        <button
          onClick={handleNextExercise}
          className="flex-1 py-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <span>
            {currentExerciseIndex === exercisesState.length - 1 ? "FINISH WORKOUT" : "NEXT EXERCISE"}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* PR Celebration Modal Popup */}
      {newPRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-400 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400">
              <Trophy className="w-9 h-9 fill-amber-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
                🔥 NEW PERSONAL RECORD!
              </span>
              <h3 className="text-xl font-black text-white">{newPRModal.exerciseName}</h3>
              <p className="text-2xl font-extrabold text-lime-400 mt-2 font-mono">
                {newPRModal.maxWeightKg} KG × {newPRModal.maxRepsAtMaxWeight} REPS
              </p>
            </div>
            <button
              onClick={() => setNewPRModal(null)}
              className="w-full py-3 bg-amber-400 text-black font-extrabold text-sm rounded-xl shadow-lg hover:bg-amber-300"
            >
              CRUSHED IT! 💪
            </button>
          </div>
        </div>
      )}

      {/* Gym Session Summary Celebration Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-lime-400/40 p-6 rounded-3xl max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-lime-400/20 border border-lime-400 flex items-center justify-center text-lime-400">
              <Flame className="w-8 h-8 fill-lime-400" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black tracking-widest text-lime-400 uppercase">
                🔥 WORKOUT COMPLETE
              </span>
              <h3 className="text-2xl font-black text-white">{workoutPlan.workoutName}</h3>
              <p className="text-xs text-zinc-400">“Great workout, Veer! Recovery starts now.”</p>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Duration</span>
                <div className="text-lg font-black text-white">{Math.round(elapsedWorkoutSec / 60)} min</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Sets</span>
                <div className="text-lg font-black text-white">{totalCompletedSets} sets</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Volume</span>
                <div className="text-lg font-black text-lime-400">{totalVolume.toLocaleString()} kg</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Consistency</span>
                <div className="text-lg font-black text-amber-400">+1 Day Boost 🔥</div>
              </div>
            </div>

            <button
              onClick={() => {
                onFinishWorkout(
                  { ...workoutPlan, exercises: exercisesState },
                  Math.round(elapsedWorkoutSec / 60),
                  totalVolume
                );
              }}
              className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-lime-400/20 active:scale-95 transition"
            >
              SAVE WORKOUT LOG & RETURN
            </button>
          </div>
        </div>
      )}

      {/* Exercise Detail Slide-Up Modal */}
      {detailModalExercise && (
        <ExerciseDetailModal
          exercise={detailModalExercise}
          prs={prs}
          onClose={() => setDetailModalExercise(null)}
          onAddNewPR={onAddNewPR}
        />
      )}
    </div>
  );
};
