import React, { useState } from "react";
import { Play, Timer, X, Zap, Clock, Check } from "lucide-react";
import { WorkoutPlan } from "../types";

interface StartWorkoutModalProps {
  workoutPlan: WorkoutPlan;
  onConfirmStart: (customRestSec?: number) => void;
  onClose: () => void;
}

export const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({
  workoutPlan,
  onConfirmStart,
  onClose,
}) => {
  // Default session rest timer based on first exercise or fallback to 90s
  const defaultRest = workoutPlan.exercises?.[0]?.defaultRestSec || 90;
  const [selectedRestSec, setSelectedRestSec] = useState<number>(defaultRest);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>(defaultRest.toString());

  const presets = [
    { label: "30s", value: 30, desc: "Fast Pace" },
    { label: "60s", value: 60, desc: "Standard" },
    { label: "90s", value: 90, desc: "Hypertrophy" },
    { label: "120s", value: 120, desc: "Heavy Lift" },
    { label: "180s", value: 180, desc: "Power / PR" },
  ];

  const handleSelectPreset = (sec: number) => {
    setSelectedRestSec(sec);
    setCustomInputVal(sec.toString());
    setIsCustomMode(false);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputVal(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setSelectedRestSec(num);
    }
  };

  const handleAdjustCustom = (deltaSec: number) => {
    const nextVal = Math.max(10, selectedRestSec + deltaSec);
    setSelectedRestSec(nextVal);
    setCustomInputVal(nextVal.toString());
  };

  const handleStart = () => {
    onConfirmStart(selectedRestSec);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-lime-400/10 border border-lime-400/30 rounded-2xl text-lime-400">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Start Workout Session
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Configure session rest timer & begin workout
            </p>
          </div>
        </div>

        {/* Workout Plan Preview Card */}
        <div className="p-4 rounded-2xl bg-zinc-800/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-lime-400 uppercase tracking-wider">
            <span>{workoutPlan.day} Schedule</span>
            <span className="bg-lime-400/20 text-lime-300 px-2.5 py-0.5 rounded-full">
              {workoutPlan.exercises.length} Exercises
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white">
            {workoutPlan.workoutName}
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {workoutPlan.exercises.slice(0, 4).map((ex, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg border border-white/5"
              >
                {ex.name}
              </span>
            ))}
            {workoutPlan.exercises.length > 4 && (
              <span className="text-[11px] font-semibold bg-zinc-900 text-zinc-400 px-2 py-1 rounded-lg">
                +{workoutPlan.exercises.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Custom Timer Option Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-400" />
              <span>Rest Timer Duration per Set</span>
            </label>
            <span className="text-xs font-extrabold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-lg border border-lime-400/20">
              {selectedRestSec} seconds
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {presets.map((p) => {
              const isSelected = !isCustomMode && selectedRestSec === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleSelectPreset(p.value)}
                  className={`py-2.5 px-1 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-lime-400 text-black border-lime-400 font-black shadow-lg shadow-lime-400/20 scale-105"
                      : "bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 border-white/5 font-semibold"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold">{p.label}</span>
                  <span className="text-[9px] opacity-80 hidden sm:block">{p.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Time Input Toggle & Control */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span>Custom Rest Timer Duration</span>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-lime-400 hover:underline text-xs font-semibold cursor-pointer"
              >
                {isCustomMode ? "Use Presets" : "Enter Exact Seconds"}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  handleAdjustCustom(-15);
                }}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm rounded-xl border border-white/10 active:scale-95 transition"
              >
                -15s
              </button>

              <div className="relative flex-1">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={customInputVal}
                  onChange={(e) => {
                    setIsCustomMode(true);
                    handleCustomInputChange(e);
                  }}
                  className="w-full bg-black border border-lime-400/40 rounded-xl px-4 py-2 text-center text-lg font-black text-lime-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-500 pointer-events-none">
                  sec
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  handleAdjustCustom(15);
                }}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm rounded-xl border border-white/10 active:scale-95 transition"
              >
                +15s
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-lime-400 hover:bg-lime-300 active:scale-98 text-black font-black text-base rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center gap-3 transition cursor-pointer"
            id="modal-confirm-start-workout-btn"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>START WORKOUT SESSION</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-white font-bold text-sm rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
