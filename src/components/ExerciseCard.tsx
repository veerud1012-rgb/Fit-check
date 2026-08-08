import React from "react";
import { Dumbbell, Info, Plus, ChevronRight, Check } from "lucide-react";
import { MuscleGroup } from "../types";

export interface ExerciseCardData {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  equipment?: string;
  setsCount?: number;
  targetReps?: string | number;
  imageUrl?: string;
  instructions?: string;
  notes?: string;
  completed?: boolean;
}

interface ExerciseCardProps {
  exercise: ExerciseCardData;
  layout?: "left-image" | "top-image";
  variant?: "library" | "active-workout" | "dashboard" | "builder";
  onClick?: () => void;
  onActionClick?: (e: React.MouseEvent) => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  isActive?: boolean;
  stepNumber?: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  layout = "left-image",
  variant = "library",
  onClick,
  onActionClick,
  actionLabel,
  actionIcon,
  isActive = false,
  stepNumber,
}) => {
  const isTopImage = layout === "top-image";

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl bg-zinc-900 border transition-all duration-200 overflow-hidden group flex ${
        isTopImage ? "flex-col" : "flex-row items-center"
      } ${
        isActive
          ? "border-lime-400 bg-lime-400/5 shadow-lg shadow-lime-400/10"
          : "border-white/10 hover:border-lime-400/40"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Exercise Image Container */}
      <div
        className={`relative flex-shrink-0 bg-zinc-950 overflow-hidden flex items-center justify-center ${
          isTopImage
            ? "w-full h-40 border-b border-white/10"
            : variant === "active-workout"
            ? "w-20 h-20 sm:w-24 sm:h-24 m-3 rounded-2xl border border-lime-400/30"
            : variant === "dashboard"
            ? "w-16 h-16 sm:w-20 sm:h-20 m-3 rounded-2xl border border-white/10"
            : "w-24 h-24 sm:w-28 sm:h-28 m-3 rounded-2xl border border-white/10"
        }`}
      >
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-lime-400 bg-gradient-to-br from-zinc-900 to-zinc-950">
            <Dumbbell className={isTopImage ? "w-10 h-10 opacity-70" : "w-7 h-7 opacity-70"} />
            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase mt-1">
              FITPULSE
            </span>
          </div>
        )}

        {/* Step number badge if in active workout list */}
        {stepNumber !== undefined && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-lime-400 text-black font-extrabold text-xs flex items-center justify-center shadow-md">
            {stepNumber}
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div
        className={`flex-1 min-w-0 p-4 flex flex-col justify-between space-y-2 ${
          isTopImage ? "w-full" : ""
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[10px] font-extrabold uppercase tracking-wider">
                {exercise.targetMuscle}
              </span>
              {exercise.equipment && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                  {exercise.equipment}
                </span>
              )}
            </div>

            {exercise.setsCount !== undefined && exercise.targetReps !== undefined && (
              <span className="text-[11px] font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-lg border border-white/5">
                {exercise.setsCount} × {exercise.targetReps}
              </span>
            )}
          </div>

          <h3 className="text-base font-extrabold text-white group-hover:text-lime-400 transition truncate">
            {exercise.name}
          </h3>

          {exercise.instructions && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {exercise.instructions}
            </p>
          )}

          {exercise.notes && (
            <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              💡 {exercise.notes}
            </p>
          )}
        </div>

        {/* Action Button Footer if applicable */}
        {(onActionClick || actionLabel) && (
          <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-1">
            <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
              {variant === "library" ? "Exercise Info" : "Workout Step"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onActionClick) onActionClick(e);
                else if (onClick) onClick();
              }}
              className="px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-lime-300 hover:text-lime-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span>{actionLabel || "Details"}</span>
              {actionIcon || <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
