import React from "react";
import { Home, Dumbbell, Clock, LineChart, Bot } from "lucide-react";
import { AppTab } from "../types";

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onStartWorkout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: "dashboard" as AppTab, label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "workouts" as AppTab, label: "Workouts", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "timers" as AppTab, label: "Timers", icon: <Clock className="w-6 h-6" />, isCenter: true },
    { id: "progress" as AppTab, label: "Progress", icon: <LineChart className="w-5 h-5" /> },
    { id: "ai" as AppTab, label: "AI Chat", icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090a0d]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center -mt-5 group cursor-pointer"
                id={`bottom-nav-${tab.id}`}
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all transform group-active:scale-95 ${
                    isActive
                      ? "bg-lime-400 text-black shadow-lime-400/30 scale-105"
                      : "bg-lime-400 text-black shadow-lime-400/20 hover:bg-lime-300"
                  }`}
                >
                  <Clock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? "text-lime-400" : "text-zinc-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-lime-400 font-bold" : "text-zinc-400 hover:text-white"
              }`}
              id={`bottom-nav-${tab.id}`}
            >
              {tab.icon}
              <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

