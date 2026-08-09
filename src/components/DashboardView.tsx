import React from "react";
import {
  Play,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Bell,
  BarChart2,
  Check,
  Dumbbell,
  Sparkles,
  BedDouble,
} from "lucide-react";
import { WorkoutPlan, UserProfile, NotificationPreferences, PersonalRecord } from "../types";
import { getWorkoutImage } from "../utils/workoutImages";

interface DashboardViewProps {
  todayPlan: WorkoutPlan;
  profile: UserProfile;
  notifPrefs: NotificationPreferences;
  prs: PersonalRecord[];
  onStartWorkout: () => void;
  onToggleExerciseSet: (exerciseId: string, setId: string) => void;
  onOpenWorkoutsBuilder: () => void;
  onOpenTimers: () => void;
  onOpenReminders: () => void;
  onOpenProgress: () => void;
  onOpenAI: () => void;
  onOpenLibrary: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  todayPlan,
  profile,
  notifPrefs,
  onStartWorkout,
  onOpenWorkoutsBuilder,
  onOpenReminders,
  onOpenProgress,
  onOpenAI,
}) => {
  // Calculate exercise completion statistics
  const totalExercises = todayPlan.exercises.length;
  let completedExercises = 0;
  todayPlan.exercises.forEach((ex) => {
    if (ex.sets.length > 0 && ex.sets.every((s) => s.completed)) {
      completedExercises++;
    }
  });

  const progressPercent =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const activeReminder = notifPrefs.reminders.find((r) => r.enabled);

  return (
    <div className="space-y-5 pb-20 max-w-xl mx-auto">
      {/* Top Welcome Greeting Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Good Morning, <br className="sm:hidden" />
            <span className="text-lime-400">{profile.name}! 💪</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Let's crush your goals today.
          </p>
        </div>

        {/* User Profile Body Avatar & Bell Notification */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReminders}
            className="relative p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl text-zinc-300 transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {activeReminder && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-lime-400 rounded-full ring-2 ring-black" />
            )}
          </button>
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-lime-400/40 bg-zinc-800 shadow-md flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Veer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* TODAY'S WORKOUT Main Card */}
      {todayPlan.isRestDay ? (
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BedDouble className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">SUNDAY REST DAY 😴</h3>
            <p className="text-zinc-400 text-xs mt-1">
              Recovery day! Muscle repair and hydration phase active.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-[#12141c] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-black tracking-widest text-lime-400 uppercase">
                TODAY'S WORKOUT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {todayPlan.workoutName}
              </h2>
              <p className="text-xs text-zinc-400 font-semibold">
                {totalExercises} Exercises • ~{todayPlan.estimatedMinutes} Min
              </p>
            </div>

            {/* Workout Visual Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-lime-400/30 bg-zinc-900 shadow-xl flex items-center justify-center p-1">
                <img
                  src={getWorkoutImage(todayPlan.workoutName, todayPlan.muscleGroups)}
                  alt={todayPlan.workoutName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar Row */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-zinc-400">Progress</span>
              <span className="text-lime-400">
                {completedExercises} / {totalExercises} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div
                className="h-full bg-lime-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Big Lime Start Workout Button */}
          <button
            onClick={onStartWorkout}
            className="w-full py-4 bg-lime-400 hover:bg-lime-300 active:scale-98 text-black font-black text-sm rounded-2xl shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2.5 transition cursor-pointer tracking-wider uppercase mt-2"
            id="dashboard-start-workout-main-btn"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>START WORKOUT</span>
          </button>
        </div>
      )}

      {/* Next Reminder Card */}
      <div className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-400">Next Reminder</div>
            <div className="text-xs font-black text-white">
              {activeReminder ? `Today, ${activeReminder.time}` : "Today, 07:00 PM"}
            </div>
          </div>
        </div>
        <button
          onClick={onOpenReminders}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-white/5 transition cursor-pointer"
        >
          Change
        </button>
      </div>

      {/* 3 Stat Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 space-y-1 text-center sm:text-left">
          <div className="p-2 w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 mx-auto sm:mx-0 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="text-[10px] font-bold text-zinc-400">Streak</div>
          <div className="text-base sm:text-lg font-black text-white">
            {profile.streakDays} <span className="text-xs font-semibold text-zinc-400">Days</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 space-y-1 text-center sm:text-left">
          <div className="p-2 w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 mx-auto sm:mx-0 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-bold text-zinc-400">This Week</div>
          <div className="text-base sm:text-lg font-black text-white">
            5 <span className="text-xs font-semibold text-zinc-400">Workouts</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 space-y-1 text-center sm:text-left">
          <div className="p-2 w-8 h-8 rounded-xl bg-cyan-400/10 text-cyan-400 mx-auto sm:mx-0 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-bold text-zinc-400">Total Time</div>
          <div className="text-sm sm:text-base font-black text-white">
            18h 45m
            <div className="text-[9px] font-medium text-zinc-500">This Month</div>
          </div>
        </div>
      </div>

      {/* Today's Exercises Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">Today's Exercises</h3>
          <button
            onClick={onOpenWorkoutsBuilder}
            className="text-xs font-extrabold text-lime-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {todayPlan.exercises.map((exercise, index) => {
            const isCompleted =
              exercise.sets.length > 0 && exercise.sets.every((s) => s.completed);

            return (
              <div
                key={exercise.id}
                className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-3 hover:border-lime-400/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Badge */}
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-lime-400 text-black"
                        : "bg-zinc-800 text-zinc-300 border border-white/10"
                    }`}
                  >
                    {index + 1}
                  </span>

                  {/* Image / Icon */}
                  {exercise.imageUrl ? (
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-lime-400 flex-shrink-0">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  )}

                  {/* Title & Specs */}
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-sm truncate">
                      {exercise.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-medium">
                      {exercise.setsCount} Sets • {exercise.targetReps} Reps
                    </p>
                  </div>
                </div>

                {/* Status Checkmark Icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-lime-400 text-black flex items-center justify-center shadow-md shadow-lime-400/20">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-zinc-700 hover:border-lime-400 transition" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

