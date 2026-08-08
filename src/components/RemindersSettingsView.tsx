import React, { useState, useRef, useEffect } from "react";
import { Bell, Volume2, Music, Upload, Play, Pause, Square, Plus, Trash2, Check, Clock, VolumeX, AlertCircle } from "lucide-react";
import { NotificationPreferences, ReminderItem } from "../types";
import { playSynthSound, stopSynthSound, playCustomAudio, stopCustomAudio } from "../utils/audioSynth";

interface RemindersSettingsViewProps {
  notifPrefs: NotificationPreferences;
  onSavePrefs: (newPrefs: NotificationPreferences) => void;
}

export const RemindersSettingsView: React.FC<RemindersSettingsViewProps> = ({
  notifPrefs,
  onSavePrefs,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  // Custom Audio Player State
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const customAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // New Reminder state
  const [newTime, setNewTime] = useState("19:00");
  const [newLabel, setNewLabel] = useState("Evening Gym Session 💪");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  // Initialize/Sync Custom Audio Element for Preview Player
  useEffect(() => {
    const url = notifPrefs.customAudioUrl;
    if (url && (url.startsWith("data:") || url.startsWith("http:") || url.startsWith("https:"))) {
      try {
        const audio = new Audio(url);
        audio.volume = notifPrefs.alarmVolume;

        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration || 0);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime || 0);
        };

        audio.onended = () => {
          setIsPlayingCustom(false);
          setCurrentTime(0);
        };

        audio.onerror = () => {
          setIsPlayingCustom(false);
          setUploadErrorMsg("Unable to play custom audio file. Please re-upload an MP3 or WAV file.");
        };

        customAudioElementRef.current = audio;

        return () => {
          audio.pause();
          audio.currentTime = 0;
          customAudioElementRef.current = null;
        };
      } catch (err) {
        console.warn("Could not instantiate custom audio element:", err);
      }
    } else if (url && url.startsWith("blob:")) {
      // Auto-clear invalid/expired blob URL from older sessions
      onSavePrefs({
        ...notifPrefs,
        customAudioUrl: undefined,
        customAudioFileName: undefined,
        selectedRingtone: notifPrefs.selectedRingtone === "custom" ? "heavy_metal" : notifPrefs.selectedRingtone,
      });
    } else {
      customAudioElementRef.current = null;
    }
  }, [notifPrefs.customAudioUrl]);

  // Sync volume changes
  useEffect(() => {
    if (customAudioElementRef.current) {
      customAudioElementRef.current.volume = notifPrefs.alarmVolume;
    }
  }, [notifPrefs.alarmVolume]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErrorMsg("");
    setUploadSuccessMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setUploadErrorMsg("Please select a valid audio file (MP3, WAV, AAC, M4A, OGG).");
      return;
    }

    // Limit size to ~15MB for localStorage performance
    if (file.size > 15 * 1024 * 1024) {
      setUploadErrorMsg("File size is too large (max 15MB). Please select a smaller track.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSavePrefs({
          ...notifPrefs,
          customAudioUrl: dataUrl,
          customAudioFileName: file.name,
          selectedRingtone: "custom", // Auto-select custom ringtone
        });
        setUploadSuccessMsg(`✓ "${file.name}" uploaded and selected as custom alarm!`);
        setTimeout(() => setUploadSuccessMsg(""), 5000);
      }
    };

    reader.onerror = () => {
      setUploadErrorMsg("Failed to read audio file. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    if (customAudioElementRef.current) {
      customAudioElementRef.current.pause();
      customAudioElementRef.current.currentTime = 0;
    }
    setIsPlayingCustom(false);
    onSavePrefs({
      ...notifPrefs,
      customAudioUrl: undefined,
      customAudioFileName: undefined,
      selectedRingtone: notifPrefs.selectedRingtone === "custom" ? "heavy_metal" : notifPrefs.selectedRingtone,
    });
    setUploadSuccessMsg("Custom audio removed.");
    setTimeout(() => setUploadSuccessMsg(""), 3000);
  };

  const togglePlayCustomAudio = () => {
    stopSynthSound();
    setIsPlayingPreview(false);

    if (!notifPrefs.customAudioUrl) {
      fileInputRef.current?.click();
      return;
    }

    if (!customAudioElementRef.current) {
      const audio = new Audio(notifPrefs.customAudioUrl);
      audio.volume = notifPrefs.alarmVolume;
      customAudioElementRef.current = audio;
    }

    const audio = customAudioElementRef.current;

    if (isPlayingCustom) {
      audio.pause();
      setIsPlayingCustom(false);
    } else {
      audio.volume = notifPrefs.alarmVolume;
      audio
        .play()
        .then(() => {
          setIsPlayingCustom(true);
        })
        .catch((err) => {
          console.error("Playback error:", err);
          setUploadErrorMsg("Audio playback blocked by browser or unplayable format.");
        });
    }
  };

  const handlePreviewSound = () => {
    if (isPlayingPreview || isPlayingCustom) {
      stopSynthSound();
      if (customAudioElementRef.current) {
        customAudioElementRef.current.pause();
        customAudioElementRef.current.currentTime = 0;
      }
      setIsPlayingPreview(false);
      setIsPlayingCustom(false);
    } else {
      if (notifPrefs.selectedRingtone === "custom") {
        if (notifPrefs.customAudioUrl) {
          togglePlayCustomAudio();
        } else {
          fileInputRef.current?.click();
        }
      } else {
        setIsPlayingPreview(true);
        const presetMap: Record<string, any> = {
          heavy_metal: "gym_horn",
          motivational_chime: "metal_bell",
          techno_alarm: "synth_drop",
          subtle_beep: "alarm_beep",
        };
        const synthType = presetMap[notifPrefs.selectedRingtone || "motivational_chime"] || "metal_bell";
        playSynthSound(synthType, notifPrefs.alarmVolume);
        setTimeout(() => {
          setIsPlayingPreview(false);
        }, 3000);
      }
    }
  };

  const handleSeekCustomAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (customAudioElementRef.current) {
      customAudioElementRef.current.currentTime = targetTime;
    }
  };

  const formatSecs = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
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

        {/* Ringtone Option Selector including Custom Audio */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300">Choose Gym Alarm Sound</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: "custom",
                name: "🎵 Custom Uploaded Audio",
                desc: notifPrefs.customAudioFileName
                  ? `Uploaded: ${notifPrefs.customAudioFileName}`
                  : "Upload & play your own custom MP3 / WAV audio track",
              },
              { id: "heavy_metal", name: "⚡ Gym Heavy Metal Beat", desc: "Aggressive motivational synth horn" },
              { id: "motivational_chime", name: "🔔 Motivational Bell Chime", desc: "Clear metallic double gong tone" },
              { id: "techno_alarm", name: "🔊 High Energy Techno", desc: "Fast-paced workout alarm bass drop" },
              { id: "subtle_beep", name: "🏃 Subtle Beep Pulse", desc: "Gentle rhythmic alarm reminder" },
            ].map((preset) => {
              const isSelected = notifPrefs.selectedRingtone === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (preset.id === "custom" && !notifPrefs.customAudioUrl) {
                      fileInputRef.current?.click();
                    } else {
                      onSavePrefs({ ...notifPrefs, selectedRingtone: preset.id as any });
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-lime-400/10 border-lime-400 text-white shadow-md shadow-lime-400/10"
                      : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-white truncate">{preset.name}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{preset.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Audio Upload & Player Card */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-lime-400" />
                <span>Custom Audio Track</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {notifPrefs.customAudioFileName
                  ? `Active File: ${notifPrefs.customAudioFileName}`
                  : "No audio file uploaded yet. Supports MP3, WAV, AAC, M4A, OGG."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition active:scale-95 border border-lime-400/20">
                <Upload className="w-4 h-4" />
                <span>{notifPrefs.customAudioUrl ? "Change Track" : "Browse Audio File"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {notifPrefs.customAudioUrl && (
                <button
                  type="button"
                  onClick={handleRemoveCustomAudio}
                  className="p-2 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl border border-white/5 transition"
                  title="Remove Custom Audio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Upload Feedback Messages */}
          {uploadSuccessMsg && (
            <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-300 font-bold text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {uploadErrorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          {/* Interactive Custom Audio Player & Scrub Bar */}
          {notifPrefs.customAudioUrl && (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlayCustomAudio}
                    className="p-3 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl shadow-lg shadow-lime-400/20 flex items-center justify-center transition active:scale-95"
                  >
                    {isPlayingCustom ? (
                      <Pause className="w-5 h-5 fill-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                      {notifPrefs.customAudioFileName || "Custom Audio"}
                    </div>
                    <div className="text-[10px] text-lime-400 font-mono">
                      {isPlayingCustom ? "▶ Playing Preview..." : "Paused • Click Play to listen"}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-mono font-bold text-zinc-400">
                  {formatSecs(currentTime)} / {formatSecs(audioDuration)}
                </div>
              </div>

              {/* Seek Timeline Bar */}
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeekCustomAudio}
                className="w-full accent-lime-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Sound Volume Slider & Preview Button */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">
              Alarm Volume ({Math.round(notifPrefs.alarmVolume * 100)}%)
            </span>
            <button
              onClick={handlePreviewSound}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
            >
              {isPlayingPreview || isPlayingCustom ? (
                <Square className="w-3.5 h-3.5 fill-black" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black" />
              )}
              <span>{isPlayingPreview || isPlayingCustom ? "STOP PREVIEW" : "TEST RINGTONE"}</span>
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
