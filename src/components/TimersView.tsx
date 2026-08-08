import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock, Volume2, Flag, Square, Bell } from "lucide-react";
import { playRingtoneFromPrefs, stopSynthSound } from "../utils/audioSynth";
import { triggerDeviceVibration } from "../utils/notifications";
import { NotificationPreferences } from "../types";

interface TimersViewProps {
  notifPrefs?: NotificationPreferences;
}

export const TimersView: React.FC<TimersViewProps> = ({ notifPrefs }) => {
  const [activeTab, setActiveTab] = useState<"countdown" | "stopwatch">("countdown");

  // Countdown Timer state
  const [countdownSec, setCountdownSec] = useState(90);
  const [initialCountdown, setInitialCountdown] = useState(90);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isTimerAlarmActive, setIsTimerAlarmActive] = useState(false);

  // Stopwatch state
  const [stopwatchSec, setStopwatchSec] = useState(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Countdown Interval
  useEffect(() => {
    let interval: number | null = null;
    if (isCountdownActive && countdownSec > 0) {
      interval = window.setInterval(() => {
        setCountdownSec((prev) => prev - 1);
      }, 1000);
    } else if (isCountdownActive && countdownSec === 0) {
      setIsCountdownActive(false);
      setIsTimerAlarmActive(true);
      playRingtoneFromPrefs(notifPrefs, "rest_complete");
      triggerDeviceVibration([300, 100, 300, 100, 500]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, countdownSec, notifPrefs]);

  // Stopwatch Interval
  useEffect(() => {
    let interval: number | null = null;
    if (isStopwatchActive) {
      interval = window.setInterval(() => {
        setStopwatchSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchActive]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatStopwatch = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const setPreset = (sec: number) => {
    setIsCountdownActive(false);
    setCountdownSec(sec);
    setInitialCountdown(sec);
  };

  const handleAddLap = () => {
    setLaps((prev) => [stopwatchSec, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Mode Switcher Tabs */}
      <div className="p-1.5 rounded-2xl bg-zinc-900 border border-white/10 flex items-center gap-1">
        <button
          onClick={() => setActiveTab("countdown")}
          className={`flex-1 py-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === "countdown"
              ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>REST COUNTDOWN TIMER</span>
        </button>

        <button
          onClick={() => setActiveTab("stopwatch")}
          className={`flex-1 py-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === "stopwatch"
              ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>STOPWATCH MODE</span>
        </button>
      </div>

      {/* Countdown Timer Mode */}
      {activeTab === "countdown" && (
        <div className="p-8 rounded-3xl bg-zinc-900 border border-white/10 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-black text-lime-400 uppercase tracking-widest">
              REST & WORKOUT TIMER
            </span>
            <h3 className="text-xl font-extrabold text-white">Rest Duration Countdown</h3>
          </div>

          {/* Big Countdown Display */}
          <div className="py-6">
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-wider text-lime-400">
              {formatCountdown(countdownSec)}
            </div>
            {countdownSec === 0 && (
              <div className="mt-4 p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 space-y-3 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-red-300 font-black text-sm uppercase">
                  <Volume2 className="w-5 h-5 text-yellow-300 animate-bounce" />
                  <span>REST COMPLETE! ALARM IS RINGING</span>
                </div>
                <button
                  onClick={() => {
                    stopSynthSound();
                    setIsTimerAlarmActive(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 mx-auto transition active:scale-95"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP ALARM SOUND NOW</span>
                </button>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-400">QUICK REST PRESETS</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "30s", sec: 30 },
                { label: "45s", sec: 45 },
                { label: "60s", sec: 60 },
                { label: "90s", sec: 90 },
                { label: "2 min", sec: 120 },
                { label: "5 min", sec: 300 },
                { label: "10 min", sec: 600 },
              ].map((p) => (
                <button
                  key={p.sec}
                  onClick={() => setPreset(p.sec)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                    initialCountdown === p.sec && countdownSec > 0
                      ? "bg-lime-400 text-black border-lime-400"
                      : "bg-zinc-800 text-zinc-300 border-white/5 hover:border-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Adjustments */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCountdownSec((p) => Math.max(0, p - 10))}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded-xl border border-white/5"
            >
              -10 SEC
            </button>
            <button
              onClick={() => setCountdownSec((p) => p + 10)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded-xl border border-white/5"
            >
              +10 SEC
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsCountdownActive(false);
                setCountdownSec(initialCountdown);
              }}
              className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCountdownActive(!isCountdownActive)}
              className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-lime-400/20 flex items-center gap-2 active:scale-95 transition"
            >
              {isCountdownActive ? (
                <>
                  <Pause className="w-5 h-5 fill-black" />
                  <span>PAUSE TIMER</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-black" />
                  <span>START TIMER</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stopwatch Mode */}
      {activeTab === "stopwatch" && (
        <div className="p-8 rounded-3xl bg-zinc-900 border border-white/10 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-black text-lime-400 uppercase tracking-widest">
              STOPWATCH & LAP TRACKER
            </span>
            <h3 className="text-xl font-extrabold text-white">Elapsed Time Tracker</h3>
          </div>

          {/* Big Stopwatch Display */}
          <div className="py-6">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-lime-400">
              {formatStopwatch(stopwatchSec)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsStopwatchActive(false);
                setStopwatchSec(0);
                setLaps([]);
              }}
              className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsStopwatchActive(!isStopwatchActive)}
              className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-lime-400/20 flex items-center gap-2 active:scale-95 transition"
            >
              {isStopwatchActive ? (
                <>
                  <Pause className="w-5 h-5 fill-black" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-black" />
                  <span>START</span>
                </>
              )}
            </button>

            {isStopwatchActive && (
              <button
                onClick={handleAddLap}
                className="p-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-2xl"
                title="Lap"
              >
                <Flag className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-2 text-left">
              <span className="text-xs font-bold text-zinc-400">RECORDED LAPS ({laps.length})</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {laps.map((lap, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between text-xs font-mono font-bold"
                  >
                    <span className="text-zinc-400">Lap {laps.length - idx}</span>
                    <span className="text-lime-400">{formatStopwatch(lap)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
