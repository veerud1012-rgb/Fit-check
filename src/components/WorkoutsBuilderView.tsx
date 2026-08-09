import React, { useState } from "react";
import {
  Dumbbell,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  BedDouble,
  Check,
  Edit3,
  X,
  Clock,
  Sparkles,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { WorkoutPlan, WorkoutExercise, ExerciseItem, MuscleGroup, DayOfWeek } from "../types";
import { getWorkoutImage } from "../utils/workoutImages";

interface WorkoutsBuilderViewProps {
  schedule: WorkoutPlan[];
  exerciseLibrary: ExerciseItem[];
  onSaveSchedule: (newSchedule: WorkoutPlan[]) => void;
  onOpenLibrary: () => void;
}

const ALL_MUSCLES: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Abs",
  "Neck",
  "Cardio",
  "Full Body",
];

export const WorkoutsBuilderView: React.FC<WorkoutsBuilderViewProps> = ({
  schedule,
  exerciseLibrary,
  onSaveSchedule,
  onOpenLibrary,
}) => {
  const [editingDay, setEditingDay] = useState<WorkoutPlan | null>(null);
  const [selectedExerciseForAdd, setSelectedExerciseForAdd] = useState("");

  const handleOpenEdit = (plan: WorkoutPlan) => {
    setEditingDay(JSON.parse(JSON.stringify(plan)));
  };

  const handleToggleRestDay = () => {
    if (!editingDay) return;
    setEditingDay({
      ...editingDay,
      isRestDay: !editingDay.isRestDay,
      workoutName: !editingDay.isRestDay ? "Rest Day 😴" : "Custom Workout",
    });
  };

  const handleToggleMuscleGroup = (muscle: MuscleGroup) => {
    if (!editingDay) return;
    const exists = editingDay.muscleGroups.includes(muscle);
    const updated = exists
      ? editingDay.muscleGroups.filter((m) => m !== muscle)
      : [...editingDay.muscleGroups, muscle];
    setEditingDay({ ...editingDay, muscleGroups: updated });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDay) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setEditingDay({
          ...editingDay,
          customImageUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = () => {
    if (!editingDay) return;
    const copy = { ...editingDay };
    delete copy.customImageUrl;
    setEditingDay(copy);
  };

  const handleAddExerciseToPlan = () => {
    if (!editingDay || !selectedExerciseForAdd) return;
    const item = exerciseLibrary.find((ex) => ex.id === selectedExerciseForAdd);
    if (!item) return;

    const newExercise: WorkoutExercise = {
      id: `ex_plan_${Date.now()}`,
      exerciseId: item.id,
      name: item.name,
      targetMuscle: item.targetMuscle,
      setsCount: item.defaultSets,
      targetReps: typeof item.defaultReps === "number" ? item.defaultReps.toString() : item.defaultReps,
      weightKg: 20,
      restSec: item.defaultRestSec,
      imageUrl: item.imageUrl,
      sets: Array.from({ length: item.defaultSets }, (_, i) => ({
        id: `s_${Date.now()}_${i}`,
        setNumber: i + 1,
        weightKg: 20,
        reps: 10,
        completed: false,
      })),
    };

    setEditingDay({
      ...editingDay,
      exercises: [...editingDay.exercises, newExercise],
    });
    setSelectedExerciseForAdd("");
  };

  const handleRemoveExercise = (id: string) => {
    if (!editingDay) return;
    setEditingDay({
      ...editingDay,
      exercises: editingDay.exercises.filter((ex) => ex.id !== id),
    });
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (!editingDay) return;
    const arr = [...editingDay.exercises];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[targetIdx];
    arr[targetIdx] = temp;
    setEditingDay({ ...editingDay, exercises: arr });
  };

  const handleSaveDay = () => {
    if (!editingDay) return;
    const updated = schedule.map((plan) => (plan.day === editingDay.day ? editingDay : plan));
    onSaveSchedule(updated);
    setEditingDay(null);
  };

  const handleDuplicateDay = (sourcePlan: WorkoutPlan, targetDayName: DayOfWeek) => {
    const duplicatedPlan: WorkoutPlan = {
      ...sourcePlan,
      day: targetDayName,
      exercises: sourcePlan.exercises.map((ex) => ({
        ...ex,
        id: `ex_dup_${Date.now()}_${Math.random()}`,
      })),
    };
    const updated = schedule.map((p) => (p.day === targetDayName ? duplicatedPlan : p));
    onSaveSchedule(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/10">
        <div>
          <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
            CUSTOM WORKOUT SPLIT BUILDER
          </span>
          <h2 className="text-2xl font-black text-white">Weekly Workout Schedule</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Customize your training routine for every day of the week.
          </p>
        </div>

        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-bold text-xs rounded-xl border border-white/10"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Exercise Library</span>
        </button>
      </div>

      {/* Weekly Days List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schedule.map((plan) => (
          <div
            key={plan.day}
            className={`rounded-3xl border transition-all duration-300 overflow-hidden grid grid-cols-12 ${
              plan.isRestDay
                ? "bg-zinc-950/80 border-white/5 opacity-80"
                : "bg-zinc-900 border-white/10 hover:border-lime-400/30 shadow-xl"
            }`}
          >
            {/* Left Split: Full Height Image Card */}
            <div className="col-span-5 sm:col-span-4 relative overflow-hidden bg-zinc-950 flex items-center justify-center border-r border-white/10 group min-h-[220px]">
              {!plan.isRestDay ? (
                <>
                  <img
                    src={plan.customImageUrl || getWorkoutImage(plan.workoutName, plan.muscleGroups)}
                    alt={plan.workoutName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center z-10">
                    <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-lime-400/30 shadow-md">
                      {plan.day.slice(0, 3)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center h-full w-full bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <BedDouble className="w-10 h-10 text-blue-400 mb-2" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    REST DAY
                  </span>
                </div>
              )}
            </div>

            {/* Right Split: Workout Name & Details */}
            <div className="col-span-7 sm:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                {/* Header: Day & Exercise Count */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black tracking-widest text-lime-400 uppercase">
                    {plan.day}
                  </span>
                  {plan.isRestDay ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center gap-1">
                      <BedDouble className="w-3 h-3" /> REST
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800/80 px-2 py-0.5 rounded-md border border-white/5">
                      {plan.exercises.length} Exercises
                    </span>
                  )}
                </div>

                {/* Workout Title & Muscle Tags */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase leading-snug">
                    {plan.workoutName}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {plan.muscleGroups.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 border border-white/5 text-[10px] font-bold text-zinc-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exercises Preview List */}
                {!plan.isRestDay && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-zinc-400">
                    {plan.exercises.slice(0, 4).map((ex, idx) => (
                      <div key={ex.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-zinc-500 text-[10px] font-bold">{idx + 1}.</span>
                          {ex.imageUrl ? (
                            <img
                              src={ex.imageUrl}
                              alt={ex.name}
                              className="w-5 h-5 object-cover rounded border border-lime-400/30 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-lime-400">
                              <Dumbbell className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <span className="text-zinc-200 font-medium truncate text-[11px]">
                            {ex.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">
                          {ex.setsCount}×{ex.targetReps}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 4 && (
                      <div className="text-[10px] text-lime-400 font-bold italic pt-0.5">
                        + {plan.exercises.length - 4} more exercises
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>EDIT ROUTINE</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Day Routine Modal */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-black text-lime-400 tracking-widest uppercase">
                  EDITING {editingDay.day.toUpperCase()}
                </span>
                <h3 className="text-xl font-black text-white">Customize Workout Day</h3>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rest Day Toggle */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white">Rest Day Status</div>
                <div className="text-xs text-zinc-400">
                  Mark this day as an official recovery rest day.
                </div>
              </div>
              <button
                onClick={handleToggleRestDay}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                  editingDay.isRestDay
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {editingDay.isRestDay ? "REST DAY 😴" : "WORKOUT DAY 💪"}
              </button>
            </div>

            {!editingDay.isRestDay && (
              <div className="space-y-5">
                {/* Workout Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Workout Name</label>
                  <input
                    type="text"
                    value={editingDay.workoutName}
                    onChange={(e) => setEditingDay({ ...editingDay, workoutName: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
                    placeholder="e.g. Chest + Shoulder"
                  />
                </div>

                {/* Workout Card Image Selector */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-lime-400" />
                    <span>Workout Card Image (Left Split)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-lime-400/30 bg-black flex-shrink-0 relative group">
                      <img
                        src={
                          editingDay.customImageUrl ||
                          getWorkoutImage(editingDay.workoutName, editingDay.muscleGroups)
                        }
                        alt="Workout Preview"
                        className="w-full h-full object-cover"
                      />
                      {editingDay.customImageUrl && (
                        <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="text-[9px] font-black text-lime-400 uppercase">CUSTOM</span>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow">
                          <Upload className="w-3.5 h-3.5" />
                          <span>UPLOAD IMAGE</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>

                        {editingDay.customImageUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveCustomImage}
                            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-white/5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>RESET DEFAULT</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={editingDay.customImageUrl || ""}
                        onChange={(e) =>
                          setEditingDay({ ...editingDay, customImageUrl: e.target.value })
                        }
                        placeholder="Or paste image URL (https://...)"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Muscle Groups Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Target Muscle Groups</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_MUSCLES.map((muscle) => {
                      const selected = editingDay.muscleGroups.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => handleToggleMuscleGroup(muscle)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            selected
                              ? "bg-lime-400 text-black border-lime-400"
                              : "bg-zinc-950 text-zinc-400 border-white/10 hover:border-white/30"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {muscle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Exercise from Library */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs font-bold text-zinc-300">Add Exercise from Library</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedExerciseForAdd}
                      onChange={(e) => setSelectedExerciseForAdd(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-lime-400"
                    >
                      <option value="">Select an exercise...</option>
                      {exerciseLibrary.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.targetMuscle})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddExerciseToPlan}
                      disabled={!selectedExerciseForAdd}
                      className="px-4 py-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ADD</span>
                    </button>
                  </div>
                </div>

                {/* Exercises List in Routine */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300">
                    ROUTINE EXERCISES ({editingDay.exercises.length})
                  </span>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {editingDay.exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-lime-400">{idx + 1}.</span>
                          {ex.imageUrl ? (
                            <img
                              src={ex.imageUrl}
                              alt={ex.name}
                              className="w-10 h-10 object-cover rounded-xl border border-lime-400/30 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-lime-400">
                              <Dumbbell className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-white">{ex.name}</div>
                            <div className="text-xs text-zinc-400">
                              {ex.setsCount} Sets × {ex.targetReps} Reps • {ex.weightKg} kg
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveExercise(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveExercise(idx, "down")}
                            disabled={idx === editingDay.exercises.length - 1}
                            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-1.5 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setEditingDay(null)}
                className="px-5 py-3 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveDay}
                className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow-lg"
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
