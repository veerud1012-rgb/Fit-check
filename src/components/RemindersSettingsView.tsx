import React, { useState } from "react";
import { Bell, Volume2, Music, Upload, Play, Square, Plus, Trash2, Check, Clock } from "lucide-react";
import { NotificationPreferences, ReminderItem, RingtonePreset } from "../types";
import { playSynthSound, stopSynthSound } from "../utils/audioSynth";

interface RemindersSettingsViewProps {
  notifPrefs: NotificationPreferences;
  onSavePrefs: (newPrefs: NotificationPreferences) => void;
}

export const RemindersSettingsView: React.FC<RemindersSettingsViewProps> = ({
  notifPrefs,
  onSavePrefs,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // New Reminder state
  const [newTime, setNewTime] = useState("19:00");
  const [newLabel, setNewLabel] = useState("Evening Gym Session 💪");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const handleToggleReminder = (id: string) => {
    const updated = notifPrefs.reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onSavePrefs({ ...notifPrefs, reminders: updated });
  };

  const handleDeleteReminder = (id: string) => {
    const updated = notifPrefs.reminders.filter((r) => r.id !== id);
    onSavePrefs({ ...notifPrefs, reminders: updated });
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: ReminderItem = {
      id: `rem_${Date.now()}`,
      time: newTime,
      label: newLabel,
      days: selectedDays as any,
      enabled: true,
    };
    onSavePrefs({ ...notifPrefs, reminders: [...notifPrefs.reminders, newRem] });
    setShowAddReminderModal(false);
  };

  const handlePreviewSound = () => {
    if (isPlayingPreview) {
      stopSynthSound();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      playSynthSound("alarm_beep", notifPrefs.alarmVolume);
      setTimeout(() => {
        setIsPlayingPreview(false);
      }, 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSavePrefs({
        ...notifPrefs,
        customAudioUrl: url,
        customAudioFileName: file.name,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" />
          NOTIFICATIONS & AUDIO RINGTONE
        </span>
        <h2 className="text-2xl font-black text-white">Workout Reminders & Alarms</h2>
        <p className="text-xs text-zinc-400">
          Set automatic workout alarms so you never miss a training session.
        </p>
      </div>

      {/* Active Reminders List */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white">Scheduled Workout Alarms</h3>
          <button
            onClick={() => setShowAddReminderModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl shadow"
          >
            <Plus className="w-4 h-4" />
            <span>ADD ALARM</span>
          </button>
        </div>

        <div className="space-y-3">
          {notifPrefs.reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                rem.enabled ? "bg-zinc-950 border-amber-500/30" : "bg-zinc-950/40 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 border border-white/5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-white font-mono">{rem.time}</div>
                  <div className="text-xs font-bold text-zinc-300">{rem.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{rem.days.join(" • ")}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                    rem.enabled ? "bg-lime-400 justify-end" : "bg-zinc-800 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black shadow" />
                </button>

                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-zinc-900 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ringtone & Audio Engine Customization */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-6">
        <div>
          <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
            AUDIO ENGINE & RINGTONE
          </span>
          <h3 className="text-xl font-black text-white">Alarm Ringtone Preferences</h3>
        </div>

        {/* Preset Ringtone Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300">Choose Preset Gym Sound</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: "heavy_metal", name: "⚡ Gym Heavy Metal Beat", desc: "Aggressive motivational synth pulse" },
              { id: "motivational_chime", name: "🔔 Motivational Bell Chime", desc: "Clear double chime tone" },
              { id: "techno_alarm", name: "🔊 High Energy Techno", desc: "Fast-paced workout alarm" },
              { id: "subtle_beep", name: "🏃 Subtle Beep Pulse", desc: "Gentle rhythmic reminder" },
            ].map((preset) => {
              const isSelected = notifPrefs.selectedRingtone === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSavePrefs({ ...notifPrefs, selectedRingtone: preset.id as any })}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-lime-400/10 border-lime-400 text-white"
                      : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-white">{preset.name}</div>
                    <div className="text-[10px] text-zinc-400">{preset.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-lime-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom MP3 Upload */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Upload Custom Audio File (MP3 / WAV)</div>
              <div className="text-[10px] text-zinc-400">
                {notifPrefs.customAudioFileName || "No custom audio file uploaded yet."}
              </div>
            </div>

            <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              <span>Browse Audio</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Sound Volume Slider & Preview Button */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Alarm Volume ({Math.round(notifPrefs.alarmVolume * 100)}%)</span>
            <button
              onClick={handlePreviewSound}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              {isPlayingPreview ? <Square className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{isPlayingPreview ? "STOP PREVIEW" : "TEST RINGTONE"}</span>
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={notifPrefs.alarmVolume}
            onChange={(e) => onSavePrefs({ ...notifPrefs, alarmVolume: Number(e.target.value) })}
            className="w-full accent-lime-400"
          />
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddReminder}
            className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-black text-white">Add Workout Alarm</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300">Alarm Time</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-lg font-bold font-mono text-white"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-300">Alarm Label</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddReminderModal(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-lime-400 text-black font-extrabold text-xs rounded-xl"
              >
                SAVE ALARM
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
