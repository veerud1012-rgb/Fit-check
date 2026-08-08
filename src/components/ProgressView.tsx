import React, { useState } from "react";
import {
  LineChart,
  Activity,
  Flame,
  Scale,
  Ruler,
  Plus,
  Trophy,
  Calendar,
  X,
  TrendingUp,
} from "lucide-react";
import { BodyMeasurement, WorkoutLog, UserProfile } from "../types";

interface ProgressViewProps {
  profile: UserProfile;
  workoutLogs: WorkoutLog[];
  bodyStats: BodyMeasurement[];
  onAddBodyStat: (stat: BodyMeasurement) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  workoutLogs,
  bodyStats,
  onAddBodyStat,
}) => {
  const [showAddStatModal, setShowAddStatModal] = useState(false);

  // Form states
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [weightKg, setWeightKg] = useState<number | undefined>(72);
  const [chestCm, setChestCm] = useState<number | undefined>(102);
  const [waistCm, setWaistCm] = useState<number | undefined>(80.5);
  const [armsCm, setArmsCm] = useState<number | undefined>(35.5);
  const [thighsCm, setThighsCm] = useState<number | undefined>(57);
  const [shouldersCm, setShouldersCm] = useState<number | undefined>(118);

  // Calculate volume
  const totalVolumeKg = workoutLogs.reduce((acc, log) => acc + log.totalVolumeKg, 12850);
  const totalWorkouts = workoutLogs.length > 0 ? workoutLogs.length : 18;

  // Latest vs initial comparison
  const sortedStats = [...bodyStats].sort((a, b) => (a.date > b.date ? 1 : -1));
  const firstStat = sortedStats[0];
  const latestStat = sortedStats[sortedStats.length - 1] || firstStat;

  const handleStatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BodyMeasurement = {
      id: `bs_${Date.now()}`,
      date: dateStr,
      weightKg,
      chestCm,
      waistCm,
      armsCm,
      thighsCm,
      shouldersCm,
    };
    onAddBodyStat(newEntry);
    setShowAddStatModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
        <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
          PROGRESS & BODY ANALYTICS
        </span>
        <h2 className="text-2xl font-black text-white">Fitness Progress Overview</h2>
        <p className="text-xs text-zinc-400">
          Track your workout frequency, volume progression, and body measurements.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>STREAK</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{profile.streakDays} Days</div>
          <p className="text-[10px] text-lime-400 font-bold">Active Gym Routine</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>WORKOUTS</span>
            <Activity className="w-4 h-4 text-lime-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalWorkouts} Sessions</div>
          <p className="text-[10px] text-zinc-400">Recorded history</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>TOTAL VOLUME</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-lime-400">{totalVolumeKg.toLocaleString()} kg</div>
          <p className="text-[10px] text-zinc-400">Cumulative weight lifted</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>BODY WEIGHT</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{latestStat?.weightKg || 72} KG</div>
          <p className="text-[10px] text-lime-400 font-bold">
            {firstStat && latestStat
              ? `${((latestStat.weightKg || 0) - (firstStat.weightKg || 0)).toFixed(1)} KG change`
              : "Tracked in body stats"}
          </p>
        </div>
      </div>

      {/* Body Stats Tracker Section */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-lime-400 uppercase tracking-widest">
              BODY STATS & MEASUREMENTS
            </span>
            <h3 className="text-xl font-black text-white">Body Composition Progress</h3>
          </div>

          <button
            onClick={() => setShowAddStatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>LOG MEASUREMENT</span>
          </button>
        </div>

        {/* Comparison Overview */}
        {firstStat && latestStat && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Weight", start: firstStat.weightKg, current: latestStat.weightKg, unit: "KG" },
              { label: "Chest", start: firstStat.chestCm, current: latestStat.chestCm, unit: "cm" },
              { label: "Waist", start: firstStat.waistCm, current: latestStat.waistCm, unit: "cm" },
              { label: "Arms", start: firstStat.armsCm, current: latestStat.armsCm, unit: "cm" },
              { label: "Thighs", start: firstStat.thighsCm, current: latestStat.thighsCm, unit: "cm" },
              { label: "Shoulders", start: firstStat.shouldersCm, current: latestStat.shouldersCm, unit: "cm" },
            ].map((m, idx) => {
              const diff = (m.current || 0) - (m.start || 0);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{m.label}</span>
                  <div className="text-base font-black text-white">
                    {m.current} <span className="text-xs font-normal text-zinc-400">{m.unit}</span>
                  </div>
                  <div className="text-[10px] font-bold text-lime-400">
                    {m.start} → {m.current} ({diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)})
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History Table */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-zinc-400">MEASUREMENT HISTORY</span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Waist</th>
                  <th className="p-3">Arms</th>
                  <th className="p-3">Thighs</th>
                  <th className="p-3">Shoulders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {sortedStats.map((st) => (
                  <tr key={st.id} className="hover:bg-zinc-850">
                    <td className="p-3 font-sans font-bold text-white">{st.date}</td>
                    <td className="p-3 text-lime-400 font-bold">{st.weightKg} kg</td>
                    <td className="p-3">{st.chestCm} cm</td>
                    <td className="p-3">{st.waistCm} cm</td>
                    <td className="p-3">{st.armsCm} cm</td>
                    <td className="p-3">{st.thighsCm} cm</td>
                    <td className="p-3">{st.shouldersCm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Body Measurement Modal */}
      {showAddStatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleStatSubmit}
            className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">Log Body Measurements</h3>
              <button
                type="button"
                onClick={() => setShowAddStatModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300">Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={armsCm}
                    onChange={(e) => setArmsCm(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={thighsCm}
                    onChange={(e) => setThighsCm(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300">Shoulders (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shouldersCm}
                    onChange={(e) => setShouldersCm(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddStatModal(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow-lg"
              >
                SAVE LOG
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
