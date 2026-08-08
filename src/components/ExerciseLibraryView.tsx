import React, { useState } from "react";
import {
  Search,
  Plus,
  Dumbbell,
  BookOpen,
  Info,
  X,
  ShieldAlert,
  Sparkles,
  Check,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
  Columns,
} from "lucide-react";
import { ExerciseItem, MuscleGroup, EquipmentType, ExperienceLevel, PersonalRecord } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseDetailModal } from "./ExerciseDetailModal";

interface ExerciseLibraryViewProps {
  exercises: ExerciseItem[];
  prs?: PersonalRecord[];
  onAddCustomExercise: (exercise: ExerciseItem) => void;
  onAddExerciseToToday?: (exercise: ExerciseItem) => void;
  onAddNewPR?: (pr: Omit<PersonalRecord, "id">) => void;
}

const MUSCLE_CATEGORIES: (MuscleGroup | "All")[] = [
  "All",
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

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  exercises,
  prs = [],
  onAddCustomExercise,
  onAddExerciseToToday,
  onAddNewPR,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | "All">("All");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cardLayout, setCardLayout] = useState<"left-image" | "top-image">("left-image");

  // New exercise form states
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("Chest");
  const [newEquipment, setNewEquipment] = useState<EquipmentType>("Dumbbell");
  const [newDifficulty, setNewDifficulty] = useState<ExperienceLevel>("Intermediate");
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState("10-12");
  const [newRest, setNewRest] = useState(60);
  const [newInstructions, setNewInstructions] = useState("");
  const [newSafetyTips, setNewSafetyTips] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || ex.targetMuscle === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const customEx: ExerciseItem = {
      id: `ex_custom_${Date.now()}`,
      name: newName.trim(),
      targetMuscle: newMuscle,
      equipment: newEquipment,
      difficulty: newDifficulty,
      defaultSets: newSets,
      defaultReps: newReps,
      defaultRestSec: newRest,
      instructions: newInstructions || "Perform with proper form and controlled motion.",
      safetyTips: newSafetyTips || "Warm up before heavy sets and keep core braced.",
      imageUrl: newImage || undefined,
      isCustom: true,
    };

    onAddCustomExercise(customEx);
    setShowCreateModal(false);
    setNewName("");
    setNewInstructions("");
    setNewSafetyTips("");
    setNewImage(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/10">
        <div>
          <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
            EXERCISE DATABASE
          </span>
          <h2 className="text-2xl font-black text-white">Searchable Exercise Library</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse through {exercises.length} standard gym movements or create custom exercises.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE CUSTOM EXERCISE</span>
        </button>
      </div>

      {/* Search Input & Category Filters & Layout Toggle */}
      <div className="space-y-4">
        {/* Search Bar & Layout Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercise by name or muscle (e.g. 'bench', 'chest', 'squat')..."
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-white/10 flex-shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setCardLayout("left-image")}
              title="Left Image Card Layout"
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                cardLayout === "left-image"
                  ? "bg-lime-400 text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Left Image</span>
            </button>
            <button
              type="button"
              onClick={() => setCardLayout("top-image")}
              title="Top Image Card Layout"
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                cardLayout === "top-image"
                  ? "bg-lime-400 text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Top Image</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {MUSCLE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  isActive
                    ? "bg-lime-400 text-black shadow-md shadow-lime-400/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div
        className={
          cardLayout === "top-image"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "grid grid-cols-1 lg:grid-cols-2 gap-4"
        }
      >
        {filteredExercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={{
              id: ex.id,
              name: ex.name,
              targetMuscle: ex.targetMuscle,
              equipment: ex.equipment,
              setsCount: ex.defaultSets,
              targetReps: ex.defaultReps,
              imageUrl: ex.imageUrl,
              instructions: ex.instructions,
            }}
            layout={cardLayout}
            variant="library"
            onClick={() => setSelectedExercise(ex)}
            actionLabel="View Details"
            actionIcon={<Info className="w-3.5 h-3.5" />}
          />
        ))}
      </div>

      {/* Exercise Details Slide-Up Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          prs={prs}
          onClose={() => setSelectedExercise(null)}
          onAddExerciseToToday={onAddExerciseToToday}
          onAddNewPR={onAddNewPR}
        />
      )}

      {/* Create Custom Exercise Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">Create Custom Exercise</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">Exercise Image (Optional)</label>
                <div className="mt-1 flex items-center gap-3">
                  {newImage ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-lime-400/50 group flex-shrink-0">
                      <img src={newImage} alt="Exercise preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImage(null)}
                        className="absolute inset-0 bg-black/70 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-dashed border-white/20 flex flex-col items-center justify-center text-zinc-500 flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-zinc-950 border border-white/10 hover:border-lime-400/40 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition">
                      <Upload className="w-4 h-4 text-lime-400" />
                      <span>{newImage ? "Change Uploaded Image" : "Upload Exercise Image"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cable Lateral Pulldown"
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300">Target Muscle</label>
                  <select
                    value={newMuscle}
                    onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    {MUSCLE_CATEGORIES.filter((c) => c !== "All").map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-300">Equipment</label>
                  <select
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value as EquipmentType)}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  >
                    {["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Kettlebell", "Cardio Equipment"].map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-300">Default Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSets}
                    onChange={(e) => setNewSets(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Target Reps</label>
                  <input
                    type="text"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Rest (sec)</label>
                  <input
                    type="number"
                    value={newRest}
                    onChange={(e) => setNewRest(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300">Instructions</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Steps to execute the movement correctly..."
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300">Safety Tip</label>
                <input
                  type="text"
                  value={newSafetyTips}
                  onChange={(e) => setNewSafetyTips(e.target.value)}
                  placeholder="Safety precaution..."
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow-lg"
              >
                SAVE EXERCISE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
