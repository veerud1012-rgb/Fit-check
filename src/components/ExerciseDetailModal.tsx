import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Dumbbell,
  Trophy,
  Calendar,
  Sparkles,
  Plus,
  Check,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { ExerciseItem, PersonalRecord } from "../types";

interface ExerciseDetailModalProps {
  exercise: ExerciseItem | null;
  prs: PersonalRecord[];
  onClose: () => void;
  onAddExerciseToToday?: (exercise: ExerciseItem) => void;
  onAddNewPR?: (pr: Omit<PersonalRecord, "id">) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  prs,
  onClose,
  onAddExerciseToToday,
  onAddNewPR,
}) => {
  const [showAddPR, setShowAddPR] = useState(false);
  const [prWeight, setPRWeight] = useState<number>(50);
  const [prReps, setPRReps] = useState<number>(10);
  const [addedTodaySuccess, setAddedTodaySuccess] = useState(false);

  if (!exercise) return null;

  // Find PRs specific to this exercise
  const exercisePRs = prs.filter(
    (pr) =>
      pr.exerciseId === exercise.id ||
      pr.exerciseName.toLowerCase().trim() === exercise.name.toLowerCase().trim()
  );

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddNewPR) {
      onAddNewPR({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetMuscle: exercise.targetMuscle,
        maxWeightKg: Number(prWeight),
        maxRepsAtMaxWeight: Number(prReps),
        bestSetVolumeKg: Number(prWeight) * Number(prReps),
        dateAchieved: new Date().toISOString().split("T")[0],
      });
      setShowAddPR(false);
    }
  };

  const handleAddToToday = () => {
    if (onAddExerciseToToday) {
      onAddExerciseToToday(exercise);
      setAddedTodaySuccess(true);
      setTimeout(() => setAddedTodaySuccess(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 transform transition-transform"
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-zinc-700/60 rounded-full mx-auto my-2.5 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-zinc-900/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-black uppercase tracking-wider">
              {exercise.targetMuscle}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-extrabold">
              {exercise.equipment}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Large Hero Image */}
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center flex-shrink-0">
            {exercise.imageUrl ? (
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-lime-400 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 text-center">
                <Dumbbell className="w-16 h-16 opacity-60 mb-2" />
                <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                  FITPULSE EXERCISE DEMO
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {exercise.name}
                </h2>
                <p className="text-xs text-lime-400 font-bold mt-0.5">
                  {exercise.difficulty} Level • {exercise.defaultSets} Sets × {exercise.defaultReps} Reps
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-zinc-300">
                Rest: {exercise.defaultRestSec}s
              </span>
            </div>
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Target Muscle
              </span>
              <span className="text-sm font-black text-lime-400 mt-1 block">
                {exercise.targetMuscle}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Equipment
              </span>
              <span className="text-sm font-black text-white mt-1 block truncate">
                {exercise.equipment}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                PRs Recorded
              </span>
              <span className="text-sm font-black text-amber-400 mt-1 block">
                {exercisePRs.length} {exercisePRs.length === 1 ? "Record" : "Records"}
              </span>
            </div>
          </div>

          {/* Detailed Instructions */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-lime-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Execution & Instructions</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {exercise.instructions}
            </p>
          </div>

          {/* Safety & Form Tips */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Safety & Proper Form Tip</span>
            </div>
            <p className="text-sm text-amber-200/90 leading-relaxed">
              {exercise.safetyTips}
            </p>
          </div>

          {/* Specific Personal Records Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                <h3 className="text-base font-extrabold text-white">
                  Personal Records
                </h3>
              </div>

              {!showAddPR && onAddNewPR && (
                <button
                  type="button"
                  onClick={() => setShowAddPR(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New PR</span>
                </button>
              )}
            </div>

            {/* Add New PR Form inline */}
            {showAddPR && (
              <form
                onSubmit={handleSavePR}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-200"
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Log New Personal Record for {exercise.name}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Max Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={prWeight}
                      onChange={(e) => setPRWeight(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">
                      Reps Achieved
                    </label>
                    <input
                      type="number"
                      value={prReps}
                      onChange={(e) => setPRReps(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPR(false)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black shadow-md"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            )}

            {/* List of PRs */}
            {exercisePRs.length > 0 ? (
              <div className="space-y-2">
                {exercisePRs.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/20 hover:border-amber-400/40 flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-base font-black text-white">
                          {pr.maxWeightKg} kg <span className="text-xs text-amber-400 font-bold">× {pr.maxRepsAtMaxWeight} reps</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {pr.dateAchieved}
                          </span>
                          <span>•</span>
                          <span>Vol: {pr.bestSetVolumeKg} kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase border border-amber-400/20">
                        PR Holder
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-dashed border-white/10 text-center space-y-2">
                <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-400">
                  No personal records logged for this exercise yet.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Hit a new max during your workout or click "Log New PR" above to set a milestone!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-end gap-3 flex-shrink-0 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-extrabold transition"
          >
            Close
          </button>

          {onAddExerciseToToday && (
            <button
              type="button"
              onClick={handleAddToToday}
              disabled={addedTodaySuccess}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold shadow-lg flex items-center gap-2 transition ${
                addedTodaySuccess
                  ? "bg-emerald-500 text-white"
                  : "bg-lime-400 hover:bg-lime-300 text-black"
              }`}
            >
              {addedTodaySuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Today's Workout!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Today's Workout</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
