import React from "react";
import {
  Dumbbell,
  Calendar,
  BookOpen,
  Timer,
  LineChart,
  Trophy,
  Flame,
  Bot,
  Bell,
  Settings,
  X,
  Home,
  ShieldAlert,
} from "lucide-react";
import { AppTab } from "../types";

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "workouts", label: "Workouts", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="w-5 h-5" /> },
    { id: "library", label: "Exercise Library", icon: <BookOpen className="w-5 h-5" /> },
    { id: "timers", label: "Timers & Rest", icon: <Timer className="w-5 h-5" /> },
    { id: "progress", label: "Progress & Body", icon: <LineChart className="w-5 h-5" /> },
    { id: "prs", label: "Personal Records", icon: <Trophy className="w-5 h-5" />, badge: "PR" },
    { id: "ai", label: "AI Gym Assistant", icon: <Bot className="w-5 h-5" />, badge: "AI" },
    { id: "reminders", label: "Reminders & Audio", icon: <Bell className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0D0D11] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 border border-lime-400/30 rounded-xl">
              <Dumbbell className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-wider flex items-center gap-1">
                FITPULSE <span className="text-lime-400">PRO</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Digital Gym Coach</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-lime-400 text-black font-extrabold shadow-lg shadow-lime-400/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                id={`sidebar-nav-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-black text-lime-400" : "bg-lime-400/20 text-lime-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Motivation Card */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-lime-500/20 text-xs">
            <div className="flex items-center gap-2 font-bold text-lime-400 mb-1">
              <Flame className="w-4 h-4 fill-lime-400" />
              <span>CONSISTENCY IS KING</span>
            </div>
            <p className="text-zinc-400 leading-snug">
              “Your body can stand almost anything. It's your mind that you have to convince.”
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
