import React, { useState } from "react";
import { Trophy, Plus, Flame, X, Dumbbell, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { PersonalRecord, ExerciseItem, MuscleGroup } from "../types";

interface PersonalRecordsViewProps {
  prs: PersonalRecord[];
  exerciseLibrary: ExerciseItem[];
  onAddNewPR: (pr: PersonalRecord) => void;
}

export const PersonalRecordsView: React.FC<PersonalRecordsViewProps> = ({
  prs,
  exerciseLibrary,
  onAddNewPR,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [weightKg, setWeightKg] = useState(80);
  const [reps, setReps] = useState(5);

  const handleAddPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseId) return;

    const matchedExercise = exerciseLibrary.find((ex) => ex.id === selectedExerciseId);
    const exerciseName = matchedExercise ? matchedExercise.name : "Custom Exercise";
    const targetMuscle = matchedExercise ? matchedExercise.targetMuscle : "Full Body";

    const newPR: PersonalRecord = {
      id: `pr_${Date.now()}`,
      exerciseId: selectedExerciseId,
      exerciseName,
      targetMuscle: targetMuscle as MuscleGroup,
      maxWeightKg: weightKg,
      maxRepsAtMaxWeight: reps,
      bestSetVolumeKg: weightKg * reps,
      dateAchieved: new Date().toISOString().split("T")[0],
    };

    onAddNewPR(newPR);
    setShowAddModal(false);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/10">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 fill-amber-400" />
            HALL OF FAME
          </span>
          <h2 className="text-2xl font-black text-white">Personal Records (PRs)</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track your maximum lifts, peak strength gains, and historical milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>LOG NEW PR</span>
        </button>
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prs.map((pr) => {
          const exMatch = exerciseLibrary.find(
            (e) => e.id === pr.exerciseId || e.name.toLowerCase() === pr.exerciseName.toLowerCase()
          );

          return (
            <div
              key={pr.id}
              className="p-5 rounded-3xl bg-zinc-900 border border-amber-500/20 hover:border-amber-400/50 space-y-4 transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-extrabold uppercase">
                    {pr.targetMuscle}
                  </span>
                  <div className="flex items-center gap-2.5 mt-2">
                    {exMatch?.imageUrl ? (
                      <img
                        src={exMatch.imageUrl}
                        alt={pr.exerciseName}
                        className="w-9 h-9 object-cover rounded-xl border border-amber-400/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-amber-400/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                    )}
                    <h3 className="text-lg font-black text-white">{pr.exerciseName}</h3>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition flex-shrink-0">
                  <Trophy className="w-5 h-5 fill-amber-400" />
                </div>
              </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">MAX WEIGHT RECORD</span>
              <div className="text-3xl font-black text-lime-400 font-mono">
                {pr.maxWeightKg} <span className="text-base text-zinc-400 font-normal">KG</span>
                <span className="text-xs text-zinc-300 font-normal ml-2">× {pr.maxRepsAtMaxWeight} reps</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Best Set Vol: <strong className="text-zinc-200">{pr.bestSetVolumeKg} kg</strong></span>
              <span>Achieved: {pr.dateAchieved}</span>
            </div>
          </div>
          );
        })}
      </div>

      {/* Add New PR Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPR}
            className="bg-zinc-900 border border-amber-400/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Trophy className="w-4 h-4 fill-amber-400" />
                <span>LOG NEW PERSONAL RECORD</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">Select Exercise</label>
                <select
                  required
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select exercise...</option>
                  {exerciseLibrary.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.targetMuscle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300">Max Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300">Reps Completed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg"
              >
                CELEBRATE & SAVE PR 🔥
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
