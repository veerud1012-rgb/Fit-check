import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Flame, BedDouble } from "lucide-react";
import { WorkoutLog, WorkoutPlan } from "../types";

interface CalendarViewProps {
  schedule: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  onStartWorkout: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  workoutLogs,
  onStartWorkout,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLog, setSelectedDayLog] = useState<WorkoutLog | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
        <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
          WORKOUT CALENDAR & HISTORY
        </span>
        <h2 className="text-2xl font-black text-white">Monthly Activity Calendar</h2>
        <p className="text-xs text-zinc-400">
          Review past workout logs and track consistency across days.
        </p>
      </div>

      {/* Calendar Controls */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-lime-400" />
            <h3 className="text-xl font-black text-white">{monthName} {year}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-lime-400" />
            <span className="text-zinc-300 font-bold">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-zinc-300 font-bold">Planned Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-zinc-300 font-bold">Rest Day</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div key={day} className="font-extrabold text-zinc-500 py-2">
              {day}
            </div>
          ))}

          {/* Empty initial cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty_${i}`} className="p-4 rounded-2xl bg-zinc-950/30 opacity-20" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateFormatted = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
            const isToday = dateFormatted === todayStr;

            const matchingLog = workoutLogs.find((l) => l.date === dateFormatted);
            const isCompleted = !!matchingLog;

            return (
              <div
                key={dayNum}
                onClick={() => matchingLog && setSelectedDayLog(matchingLog)}
                className={`p-3 sm:p-4 rounded-2xl border transition flex flex-col items-center justify-between min-h-[70px] cursor-pointer ${
                  isToday
                    ? "bg-amber-400/10 border-amber-400"
                    : isCompleted
                    ? "bg-lime-400/10 border-lime-500/30 hover:border-lime-400"
                    : "bg-zinc-950 border-white/5 hover:border-white/20"
                }`}
              >
                <span className={`text-xs font-black ${isToday ? "text-amber-400" : "text-white"}`}>
                  {dayNum}
                </span>

                {isCompleted && (
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-sm shadow-lime-400" />
                )}
                {isToday && !isCompleted && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Log Modal */}
      {selectedDayLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase">LOG DETAILS</span>
                <h3 className="text-lg font-black text-white">{selectedDayLog.workoutName}</h3>
                <p className="text-xs text-zinc-400">{selectedDayLog.date}</p>
              </div>
              <button
                onClick={() => setSelectedDayLog(null)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                CLOSE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/5">
                <span className="text-zinc-400 font-bold">Duration</span>
                <div className="text-sm font-black text-white">{selectedDayLog.durationMinutes} min</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/5">
                <span className="text-zinc-400 font-bold">Total Volume</span>
                <div className="text-sm font-black text-lime-400">{selectedDayLog.totalVolumeKg} kg</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDayLog(null)}
              className="w-full py-3 bg-lime-400 text-black font-extrabold text-xs rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
