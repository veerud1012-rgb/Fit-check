import React from "react";
import { Flame, Bell, Sparkles, Play, Menu, Volume2 } from "lucide-react";
import { UserProfile, NotificationPreferences } from "../types";

interface HeaderProps {
  profile: UserProfile;
  notifPrefs: NotificationPreferences;
  onStartWorkout: () => void;
  onOpenReminders: () => void;
  onOpenAI: () => void;
  onToggleSidebar?: () => void;
  activeAlarmPlaying?: boolean;
  onStopAlarm?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  notifPrefs,
  onStartWorkout,
  onOpenReminders,
  onOpenAI,
  onToggleSidebar,
  activeAlarmPlaying,
  onStopAlarm,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  const nextActiveReminder = notifPrefs.reminders.find((r) => r.enabled);

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0D]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              aria-label="Toggle menu"
              id="header-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-lime-400 uppercase">
                {getGreeting()}, {profile.name.toUpperCase()} 💪
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              FitPulse Gym Tracker
            </h1>
          </div>
        </div>

        {/* Alarm Banner if ringing */}
        {activeAlarmPlaying && (
          <div className="hidden sm:flex items-center gap-3 bg-red-950/80 border border-red-500/50 text-red-200 px-3 py-1.5 rounded-xl animate-pulse">
            <Volume2 className="w-5 h-5 text-red-400 animate-bounce" />
            <span className="text-xs font-semibold">WORKOUT REMINDER RINGING!</span>
            <button
              onClick={onStopAlarm}
              className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg transition"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Right Action Chips */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Chip */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-400 font-bold text-xs sm:text-sm">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{profile.streakDays} DAYS</span>
          </div>

          {/* Reminder Quick Bell */}
          <button
            onClick={onOpenReminders}
            className="relative p-2 text-zinc-300 hover:text-lime-400 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl transition"
            title="Workout Reminders"
            id="header-reminders-btn"
          >
            <Bell className="w-5 h-5" />
            {nextActiveReminder && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-lime-400 rounded-full ring-2 ring-[#0A0A0D]" />
            )}
          </button>

          {/* AI Quick Button */}
          <button
            onClick={onOpenAI}
            className="hidden sm:flex items-center gap-1.5 p-2 text-zinc-300 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-semibold transition"
            title="Ask AI Coach"
            id="header-ai-btn"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">AI Coach</span>
          </button>

          {/* Big Start Workout Button */}
          <button
            onClick={onStartWorkout}
            className="flex items-center gap-2 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-black font-extrabold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-lime-500/20 active:scale-95 transition"
            id="header-start-workout-btn"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>START WORKOUT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
