import React, { useState } from "react";
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Save, ShieldAlert, User } from "lucide-react";
import { UserProfile, FitnessGoal, ExperienceLevel, WeightUnit } from "../types";
import { exportUserDataAsJSON, importUserDataFromJSON, clearAllAppData } from "../utils/storage";

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [preferredUnit, setPreferredUnit] = useState<WeightUnit>(profile.preferredUnit);
  const [defaultRestTimerSec, setDefaultRestTimerSec] = useState(profile.defaultRestTimerSec);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name,
      fitnessGoal,
      experienceLevel,
      preferredUnit,
      defaultRestTimerSec,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    exportUserDataAsJSON();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importUserDataFromJSON(file, () => {
        window.location.reload();
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
        <span className="text-xs font-bold text-lime-400 uppercase tracking-widest flex items-center gap-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          PREFERENCES & DATA
        </span>
        <h2 className="text-2xl font-black text-white">App Settings</h2>
        <p className="text-xs text-zinc-400">
          Customize your profile, workout defaults, and manage offline data backups.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-5">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-lime-400" />
          <span>User Profile</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-zinc-300">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
              >
                <option value="Muscle Building">Muscle Building (Hypertrophy)</option>
                <option value="Strength Training">Strength Training (Powerlifting)</option>
                <option value="Weight Loss">Weight Loss & Toning</option>
                <option value="Endurance">Endurance & Fitness</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-300">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
              >
                <option value="Beginner">Beginner (&lt; 1 Year)</option>
                <option value="Intermediate">Intermediate (1-3 Years)</option>
                <option value="Advanced">Advanced (3+ Years)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="font-bold text-zinc-300">Weight Units</label>
              <div className="flex gap-2 mt-1">
                {(["kg", "lbs"] as WeightUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setPreferredUnit(unit)}
                    className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition uppercase ${
                      preferredUnit === unit
                        ? "bg-lime-400 text-black shadow"
                        : "bg-zinc-950 text-zinc-400 border border-white/10"
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-300">Default Rest Timer Duration</label>
              <select
                value={defaultRestTimerSec}
                onChange={(e) => setDefaultRestTimerSec(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-bold text-white"
              >
                <option value={45}>45 Seconds</option>
                <option value={60}>60 Seconds</option>
                <option value={90}>90 Seconds (Recommended)</option>
                <option value={120}>120 Seconds (2 Minutes)</option>
                <option value={180}>180 Seconds (3 Minutes)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-lime-400">✓ Settings saved successfully!</span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE PREFERENCES</span>
          </button>
        </div>
      </form>

      {/* Backup & Storage Options */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
        <h3 className="text-lg font-extrabold text-white">Data Management & Backup</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-zinc-950 border border-white/10 hover:border-lime-400/40 flex items-center justify-between text-left transition"
          >
            <div>
              <div className="font-bold text-white">Export Gym Backup (.JSON)</div>
              <div className="text-[10px] text-zinc-400">Download your logs, PRs & schedule</div>
            </div>
            <Download className="w-5 h-5 text-lime-400" />
          </button>

          <label className="p-4 rounded-2xl bg-zinc-950 border border-white/10 hover:border-lime-400/40 flex items-center justify-between text-left cursor-pointer transition">
            <div>
              <div className="font-bold text-white">Import Backup (.JSON)</div>
              <div className="text-[10px] text-zinc-400">Restore workout logs from file</div>
            </div>
            <Upload className="w-5 h-5 text-cyan-400" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={onResetData}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TO DEFAULT GYM PLAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
