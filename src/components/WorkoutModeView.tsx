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
} from "lucide-react";
import confetti from "canvas-confetti";
import { WorkoutPlan, WorkoutExercise, SetData, PersonalRecord } from "../types";
import { playSynthSound } from "../utils/audioSynth";
import { triggerDeviceVibration } from "../utils/notifications";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { ExerciseItem } from "../types";

interface WorkoutModeViewProps {
  workoutPlan: WorkoutPlan;
  prs: PersonalRecord[];
  onFinishWorkout: (completedPlan: WorkoutPlan, durationMin: number, volumeKg: number) => void;
  onExitWorkout: () => void;
  onAddNewPR?: (pr: PersonalRecord) => void;
}

export const WorkoutModeView: React.FC<WorkoutModeViewProps> = ({
  workoutPlan,
  prs,
  onFinishWorkout,
  onExitWorkout,
  onAddNewPR,
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
      playSynthSound("rest_complete", 0.9);
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
      const rest = currentExercise.restSec || 90;
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

      {/* Main Active Exercise Header */}
      <ExerciseCard
        exercise={{
          id: currentExercise.id,
          name: currentExercise.name,
          targetMuscle: currentExercise.targetMuscle,
          setsCount: currentExercise.setsCount,
          targetReps: currentExercise.targetReps,
          imageUrl: currentExercise.imageUrl,
          notes: currentExercise.notes,
        }}
        layout="left-image"
        variant="active-workout"
        isActive={true}
        stepNumber={currentExerciseIndex + 1}
        onClick={() => {
          setDetailModalExercise({
            id: currentExercise.id,
            name: currentExercise.name,
            targetMuscle: currentExercise.targetMuscle,
            equipment: "Barbell / Dumbbell",
            difficulty: "Intermediate",
            defaultSets: currentExercise.setsCount,
            defaultReps: currentExercise.targetReps,
            defaultRestSec: currentExercise.restSec,
            instructions: "Focus on controlled posture and complete range of motion. Keep tension on target muscle.",
            safetyTips: "Maintain a braced core, keep joints soft at lockout, and control the weight on the descent.",
            imageUrl: currentExercise.imageUrl,
          });
        }}
        actionLabel="View Exercise Form & PRs"
      />

      {/* Set Tracker Table - Large Touch Target */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
          <span>SETS & WEIGHT</span>
          <span>COMPLETED</span>
        </div>

        <div className="space-y-2.5">
          {currentExercise.sets.map((set) => (
            <div
              key={set.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                set.completed
                  ? "bg-zinc-950 border-lime-500/30 text-zinc-400"
                  : "bg-zinc-900 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-zinc-800 text-white font-extrabold text-sm flex items-center justify-center border border-white/5">
                  {set.setNumber}
                </span>

                <div className="space-y-1">
                  {/* Weight Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateSetWeight(set.id, -2.5)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-lg font-black text-white w-16 text-center font-mono">
                      {set.weightKg} <span className="text-xs font-normal text-zinc-400">kg</span>
                    </span>
                    <button
                      onClick={() => handleUpdateSetWeight(set.id, 2.5)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reps Controls */}
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <button
                      onClick={() => handleUpdateSetReps(set.id, -1)}
                      className="p-0.5 rounded bg-zinc-800 hover:text-white"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-zinc-200 px-1">{set.reps} reps</span>
                    <button
                      onClick={() => handleUpdateSetReps(set.id, 1)}
                      className="p-0.5 rounded bg-zinc-800 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Complete Set Button */}
              <button
                onClick={() => handleToggleSet(set.id)}
                className={`px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 transition active:scale-95 ${
                  set.completed
                    ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                    : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10"
                }`}
              >
                {set.completed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 fill-black text-lime-400" />
                    <span>DONE</span>
                  </>
                ) : (
                  <span>COMPLETE</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rest Timer Card */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-lime-400">
            <Clock className="w-4 h-4" />
            <span>REST TIMER</span>
          </div>
          {isRestTimerActive && (
            <span className="text-xs font-extrabold text-amber-400 animate-pulse">RESTING...</span>
          )}
        </div>

        <div className="text-center py-2">
          <div className="text-5xl font-black font-mono tracking-wider text-lime-400">
            {formatTime(restTimeSec)}
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="grid grid-cols-4 gap-2 text-xs font-bold">
          <button
            onClick={() => setRestTimeSec((p) => p + 10)}
            className="py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-xl border border-white/5"
          >
            +10s
          </button>
          <button
            onClick={() => setRestTimeSec((p) => p + 30)}
            className="py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-xl border border-white/5"
          >
            +30s
          </button>
          <button
            onClick={() => setRestTimeSec((p) => p + 60)}
            className="py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-xl border border-white/5"
          >
            +60s
          </button>
          <button
            onClick={() => {
              setRestTimeSec(currentExercise.restSec || 90);
              setIsRestTimerActive(true);
            }}
            className="py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-400 rounded-xl border border-white/5"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRestTimerActive(!isRestTimerActive)}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            {isRestTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRestTimerActive ? "PAUSE REST" : "START REST"}</span>
          </button>
          <button
            onClick={() => setIsRestTimerActive(false)}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl"
          >
            SKIP
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
