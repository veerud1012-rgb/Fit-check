import React from "react";
import { AlertCircle, RotateCcw, FastForward, Calendar, X } from "lucide-react";
import { WorkoutPlan } from "../types";

interface MissedWorkoutModalProps {
  missedPlan: WorkoutPlan;
  onMoveToToday: () => void;
  onSkipMissed: () => void;
  onRescheduleToRestDay: () => void;
  onClose: () => void;
}

export const MissedWorkoutModal: React.FC<MissedWorkoutModalProps> = ({
  missedPlan,
  onMoveToToday,
  onSkipMissed,
  onRescheduleToRestDay,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-amber-500/40 p-6 rounded-3xl max-w-md w-full space-y-5 text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            MISSED WORKOUT DETECTED
          </span>
          <h3 className="text-xl font-black text-white">
            You missed yesterday's {missedPlan.workoutName}!
          </h3>
          <p className="text-xs text-zinc-400">
            Life happens! How would you like to handle yesterday's training session?
          </p>
        </div>

        <div className="space-y-2.5 text-left">
          <button
            onClick={onMoveToToday}
            className="w-full p-4 rounded-2xl bg-lime-400/10 border border-lime-400/40 hover:bg-lime-400/20 text-white font-bold text-xs flex items-center gap-3 transition"
          >
            <div className="p-2 rounded-xl bg-lime-400 text-black">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lime-300 font-extrabold">Move Yesterday's Workout to Today</div>
              <div className="text-[10px] text-zinc-400">Do {missedPlan.workoutName} today</div>
            </div>
          </button>

          <button
            onClick={onRescheduleToRestDay}
            className="w-full p-4 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 text-white font-bold text-xs flex items-center gap-3 transition"
          >
            <div className="p-2 rounded-xl bg-zinc-800 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-zinc-200 font-bold">Reschedule to Rest Day (Sunday)</div>
              <div className="text-[10px] text-zinc-400">Keep today's scheduled split</div>
            </div>
          </button>

          <button
            onClick={onSkipMissed}
            className="w-full p-4 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 text-white font-bold text-xs flex items-center gap-3 transition"
          >
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <div className="text-zinc-300 font-bold">Skip Yesterday's Workout</div>
              <div className="text-[10px] text-zinc-400">Proceed directly with today's split</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-bold underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
