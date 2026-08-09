import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, ShieldAlert, User, Dumbbell, RotateCcw } from "lucide-react";
import { UserProfile, WorkoutPlan } from "../types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

interface AIAssistantViewProps {
  profile: UserProfile;
  todayPlan: WorkoutPlan;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ profile, todayPlan }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_welcome",
      sender: "ai",
      text: `Hello ${profile.name}! I am your AI Gym Coach & Workout Assistant powered by Gemini. Today you have **${todayPlan.workoutName}** scheduled. How can I assist your workout, nutrition, or form today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          userContext: {
            name: profile.name,
            goal: profile.fitnessGoal,
            level: profile.experienceLevel,
            todayWorkout: todayPlan.workoutName,
          },
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.reply || "I am currently analyzing your workout query. Keep pushing!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: "Apologies, I encountered a temporary connection glitch. Make sure to stay hydrated and execute each set with tight form!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Suggest alternatives for Bench Press",
    "How to progressive overload safely?",
    "Best post-workout meal for muscle gain?",
    "Fix my Squat depth & knee placement",
    "What to do if my shoulder feels sore?",
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Screen 3 Design Layout: AI Assistant */}
      {/* Robot Neon Illustration & Header */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-lime-400/10 border-2 border-lime-400 flex items-center justify-center text-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
            <Bot className="w-10 h-10 stroke-[2.2]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-lime-400 border-2 border-black flex items-center justify-center text-[10px] text-black font-black">
            ✓
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Hello {profile.name}! 👋
          </h2>
          <p className="text-xs text-zinc-400 font-medium">How can I help you today?</p>
        </div>
      </div>

      {/* Preset Prompt Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { title: "Workout Help", desc: "Plan, split, routine", icon: "🏋️", prompt: "Help me optimize my workout split and routine" },
          { title: "Exercise Alternative", desc: "Find alternate exercises", icon: "🔄", prompt: "Suggest alternatives for Bench Press and Shoulder Press" },
          { title: "Form Tips", desc: "Improve your form", icon: "💡", prompt: "Give me form tips for Bench Press and Incline Press" },
          { title: "Nutrition", desc: "Diet & meal suggestions", icon: "🥗", prompt: "What is the best post-workout meal for muscle recovery?" },
          { title: "Recovery", desc: "Sleep, soreness, injury", icon: "🩹", prompt: "How to recover fast from severe muscle soreness?" },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="p-3.5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-lime-400/40 transition flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="font-extrabold text-white text-sm group-hover:text-lime-400 transition">
                  {item.title}
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium">{item.desc}</p>
              </div>
            </div>
            <span className="text-zinc-500 group-hover:text-lime-400 font-bold transition">›</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-[#12141c] border border-white/10 rounded-3xl p-4 space-y-4 custom-scrollbar min-h-[200px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 max-w-2xl ${
              m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                m.sender === "user"
                  ? "bg-lime-400 text-black"
                  : "bg-lime-400/20 text-lime-400 border border-lime-400/30"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                m.sender === "user"
                  ? "bg-lime-400 text-black font-semibold"
                  : "bg-zinc-900 border border-white/10 text-zinc-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div
                className={`text-[10px] text-right font-mono ${
                  m.sender === "user" ? "text-black/60" : "text-zinc-500"
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-lime-400 font-bold p-3 bg-zinc-900/60 rounded-2xl border border-lime-400/20 w-max animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>AI Coach is analyzing your query...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recent Conversations List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
          <span>Recent Conversations</span>
          <span className="text-lime-400 hover:underline cursor-pointer">View All</span>
        </div>

        <div className="space-y-1.5">
          {[
            { title: "How to increase bench press?", time: "Today" },
            { title: "Best shoulder workout?", time: "Yesterday" },
            { title: "How much protein do I need?", time: "2 Days Ago" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.title)}
              className="w-full p-2.5 rounded-xl bg-[#12141c] border border-white/5 hover:border-lime-400/30 flex items-center justify-between text-xs text-zinc-300 font-medium transition cursor-pointer"
            >
              <span>💬 {item.title}</span>
              <span className="text-[10px] text-zinc-500">{item.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Coach anything (e.g. 'How to improve my bench press?')..."
          className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-extrabold rounded-2xl shadow-lg transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
