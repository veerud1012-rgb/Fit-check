import React from "react";
import { Home, Dumbbell, Timer, LineChart, Bot } from "lucide-react";
import { AppTab } from "../types";

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onStartWorkout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onStartWorkout,
}) => {
  const tabs = [
    { id: "dashboard" as AppTab, label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "workouts" as AppTab, label: "Workouts", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "timers" as AppTab, label: "Timer", icon: <Timer className="w-5 h-5" /> },
    { id: "progress" as AppTab, label: "Progress", icon: <LineChart className="w-5 h-5" /> },
    { id: "ai" as AppTab, label: "AI Chat", icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-lime-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
              id={`bottom-nav-${tab.id}`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
