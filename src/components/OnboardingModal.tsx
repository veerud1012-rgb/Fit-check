import React, { useState } from "react";
import { Dumbbell, Flame, Sparkles, Check } from "lucide-react";
import { UserProfile, FitnessGoal, ExperienceLevel } from "../types";

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState("Veer");
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("Muscle Building");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("Intermediate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: `u_${Date.now()}`,
      name: name.trim() || "Gym Bro",
      fitnessGoal,
      experienceLevel,
      streakDays: 12,
      totalWorkouts: 28,
      joinedDate: new Date().toISOString().split("T")[0],
      preferredUnit: "kg",
      defaultRestTimerSec: 90,
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border border-lime-400/30 p-8 rounded-3xl max-w-lg w-full space-y-6 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
          <Dumbbell className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-lime-400 uppercase tracking-widest">
            WELCOME TO FITPULSE PRO
          </span>
          <h2 className="text-2xl font-black text-white">Your Digital Gym Coach</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Let's personalize your daily workout schedule and progressive overload advisor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
          <div>
            <label className="font-bold text-zinc-300">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
              placeholder="e.g. Veer"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                "Muscle Building",
                "Strength Training",
                "Weight Loss",
                "Endurance",
              ].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFitnessGoal(goal as FitnessGoal)}
                  className={`p-3 rounded-xl border font-bold text-left transition ${
                    fitnessGoal === goal
                      ? "bg-lime-400/20 border-lime-400 text-lime-300"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300">Experience Level</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level as ExperienceLevel)}
                  className={`py-2.5 rounded-xl border font-bold text-center transition ${
                    experienceLevel === level
                      ? "bg-lime-400 text-black font-extrabold border-lime-400"
                      : "bg-zinc-950 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-lime-400/20 active:scale-95 transition mt-4"
          >
            LET'S WORKOUT 🔥
          </button>
        </form>
      </div>
    </div>
  );
};
