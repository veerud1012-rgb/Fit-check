import React from "react";
import {
  Play,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Plus,
  Bell,
  LineChart,
  Bot,
  Sparkles,
  Trophy,
  Dumbbell,
  Activity,
  BedDouble,
  RotateCcw,
} from "lucide-react";
import { WorkoutPlan, WorkoutExercise, UserProfile, NotificationPreferences, PersonalRecord } from "../types";

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
  prs,
  onStartWorkout,
  onToggleExerciseSet,
  onOpenWorkoutsBuilder,
  onOpenTimers,
  onOpenReminders,
  onOpenProgress,
  onOpenAI,
  onOpenLibrary,
}) => {
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

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

  // Muscle Recovery Status Map logic based on recent workouts
  const muscleRecoveryStatus: { name: string; status: "Ready" | "Recovering" | "Trained"; color: string }[] = [
    { name: "Chest", status: todayPlan.muscleGroups.includes("Chest") ? "Trained" : "Recovering", color: "bg-red-500" },
    { name: "Shoulders", status: todayPlan.muscleGroups.includes("Shoulders") ? "Trained" : "Recovering", color: "bg-amber-500" },
    { name: "Back", status: "Ready", color: "bg-lime-400" },
    { name: "Legs", status: "Ready", color: "bg-lime-400" },
    { name: "Arms", status: todayPlan.muscleGroups.includes("Biceps") || todayPlan.muscleGroups.includes("Triceps") ? "Trained" : "Ready", color: "bg-lime-400" },
    { name: "Abs", status: "Ready", color: "bg-lime-400" },
  ];

  const activeReminder = notifPrefs.reminders.find((r) => r.enabled);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Main Question & Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-6 border border-white/10 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-400 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TODAY'S WORKOUT ADVISOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              “Aaj gym mein kya workout karna hai?”
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              Today is <span className="text-white font-bold">{currentDayName.toUpperCase()}</span>. Your schedule calls for{" "}
              <span className="text-lime-400 font-bold">
                {todayPlan.isRestDay ? "REST DAY 😴" : todayPlan.workoutName.toUpperCase()}
              </span>
              .
            </p>
          </div>

          {!todayPlan.isRestDay && (
            <button
              onClick={onStartWorkout}
              className="flex items-center justify-center gap-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-base px-6 py-4 rounded-2xl shadow-xl shadow-lime-400/20 active:scale-95 transition"
              id="dashboard-start-session-btn"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>START WORKOUT SESSION</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Today's Workout Main Card or Rest Day Card */}
      {todayPlan.isRestDay ? (
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BedDouble className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-extrabold text-white">SUNDAY REST DAY 😴</h3>
            <p className="text-zinc-400 text-sm">
              “Recovery is where the muscles actually grow.” Give your central nervous system time to adapt and repair.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            {[
              { title: "Hydration", desc: "Drink 3.5L water & electrolytes" },
              { title: "Light Mobility", desc: "15 min foam rolling & stretching" },
              { title: "Sleep Hygiene", desc: "Aim for 8+ hours deep rest" },
              { title: "Protein Intake", desc: "Maintain 1.6-2g protein per kg" },
            ].map((tip, i) => (
              <div key={i} className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 text-left space-y-1">
                <span className="text-xs font-bold text-lime-400">Recovery Step {i + 1}</span>
                <div className="text-sm font-semibold text-white">{tip.title}</div>
                <div className="text-xs text-zinc-400">{tip.desc}</div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenWorkoutsBuilder}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white underline underline-offset-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Sunday to a active workout day in Workout Builder</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Today Overview Card */}
          <div className="rounded-3xl bg-zinc-900/80 border border-white/10 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-lime-400 uppercase">
                  TODAY'S SPLIT • {currentDayName.toUpperCase()}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                  {todayPlan.workoutName}
                </h3>
                <p className="text-sm text-zinc-400 mt-1 font-medium">
                  {todayPlan.exercises.length} Exercises • ~{todayPlan.estimatedMinutes} Min Duration
                </p>
              </div>

              {/* Progress Ring / Bar */}
              <div className="sm:w-64 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-400">Progress</span>
                  <span className="text-lime-400">{completedExercises} / {totalExercises} Completed ({progressPercent}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 to-lime-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Today's Exercises List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
                <span>TODAY'S EXERCISES</span>
                <button
                  onClick={onOpenWorkoutsBuilder}
                  className="text-lime-400 hover:underline flex items-center gap-1"
                >
                  <span>Edit Split</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {todayPlan.exercises.map((exercise, index) => {
                  const isAllCompleted =
                    exercise.sets.length > 0 && exercise.sets.every((s) => s.completed);
                  const prMatch = prs.find((pr) => pr.exerciseName.toLowerCase() === exercise.name.toLowerCase());

                  return (
                    <div
                      key={exercise.id}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                        isAllCompleted
                          ? "bg-zinc-950/60 border-lime-500/20 opacity-80"
                          : "bg-zinc-900 border-white/10 hover:border-lime-400/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-zinc-800 text-lime-400 font-extrabold text-xs flex items-center justify-center border border-white/5 mt-1">
                            {index + 1}
                          </span>
                          {exercise.imageUrl ? (
                            <img
                              src={exercise.imageUrl}
                              alt={exercise.name}
                              className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-2xl border border-lime-400/40 flex-shrink-0 shadow-lg shadow-black/40"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-lime-400">
                              <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10" />
                            </div>
                          )}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">{exercise.name}</h4>
                              {prMatch && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-extrabold">
                                  <Trophy className="w-3.5 h-3.5" />
                                  PR: {prMatch.maxWeightKg}kg
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-zinc-400">
                              <span className="px-2 py-0.5 rounded-md bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-extrabold uppercase">
                                {exercise.targetMuscle}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-zinc-200">{exercise.setsCount} Sets × {exercise.targetReps} Reps</span>
                              <span>•</span>
                              <span className="font-semibold text-zinc-200">{exercise.weightKg} kg</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-xs">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                Rest: {exercise.restSec}s
                              </span>
                            </div>

                            {/* Progressive Overload Suggestion */}
                            <div className="mt-2 text-xs bg-lime-400/5 border border-lime-400/20 text-lime-300 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                              <span>Overload Tip: Last was {exercise.sets[0]?.previousWeightKg || exercise.weightKg}kg × 10. Try {((exercise.sets[0]?.previousWeightKg || exercise.weightKg) + 2.5)}kg × 8-10.</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Set Completion Status */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider sm:hidden">Sets:</span>
                          {exercise.sets.map((set) => (
                            <button
                              key={set.id}
                              onClick={() => onToggleExerciseSet(exercise.id, set.id)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold flex items-center justify-center border transition ${
                                set.completed
                                  ? "bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20"
                                  : "bg-zinc-800 text-zinc-400 border-white/10 hover:border-lime-400/40"
                              }`}
                              title={`Set ${set.setNumber}: ${set.weightKg}kg x ${set.reps}`}
                            >
                              {set.completed ? "✓" : set.setNumber}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Add Exercise", icon: <Plus className="w-5 h-5 text-lime-400" />, action: onOpenLibrary },
          { label: "Start Workout", icon: <Play className="w-5 h-5 text-lime-400" />, action: onStartWorkout },
          { label: "Rest Timer", icon: <Clock className="w-5 h-5 text-cyan-400" />, action: onOpenTimers },
          { label: "Set Reminder", icon: <Bell className="w-5 h-5 text-amber-400" />, action: onOpenReminders },
          { label: "View Progress", icon: <LineChart className="w-5 h-5 text-purple-400" />, action: onOpenProgress },
          { label: "Ask AI Coach", icon: <Bot className="w-5 h-5 text-emerald-400" />, action: onOpenAI },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="p-4 rounded-2xl bg-zinc-900 border border-white/10 hover:border-lime-400/40 hover:bg-zinc-850 flex flex-col items-center justify-center text-center gap-2 transition group"
          >
            <div className="p-2.5 rounded-xl bg-zinc-800 border border-white/5 group-hover:scale-110 transition">
              {item.icon}
            </div>
            <span className="text-xs font-bold text-zinc-200">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Workout Reminder & Muscle Recovery Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Workout Reminder Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Bell className="w-4 h-4" />
              <span>SMART WORKOUT REMINDER</span>
            </div>
            <button
              onClick={onOpenReminders}
              className="text-xs text-lime-400 hover:underline font-bold"
            >
              Configure
            </button>
          </div>

          {activeReminder ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-xl font-extrabold text-white">
                  {activeReminder.time} Today
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{activeReminder.label}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold">
                ACTIVE
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-800/50 text-center space-y-2">
              <p className="text-xs text-zinc-400">No active reminder set for today.</p>
              <button
                onClick={onOpenReminders}
                className="text-xs font-bold text-lime-400 hover:underline"
              >
                + Set 7:00 PM Reminder
              </button>
            </div>
          )}
        </div>

        {/* Muscle Recovery Map Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>MUSCLE RECOVERY MAP</span>
            </div>
            <span className="text-[11px] text-zinc-400">Estimated status</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {muscleRecoveryStatus.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-800/80 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  <span className={`w-2 h-2 rounded-full ${m.color}`} />
                </div>
                <div className="text-[10px] text-zinc-400">{m.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
