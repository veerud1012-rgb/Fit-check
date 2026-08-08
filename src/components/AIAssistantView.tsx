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
      {/* Header & Medical Disclaimer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">AI Gym Assistant & Coach</h2>
              <p className="text-xs text-zinc-400">Personalized training, exercise alternatives, and nutrition advice</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl text-xs flex items-center gap-1"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Medical Disclaimer Alert Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-400">Medical & Injury Disclaimer:</strong> FitPulse AI Assistant provides general fitness guidance and exercise recommendations. If you experience severe pain, joint discomfort, or dizziness, stop training and consult a medical doctor or licensed physical therapist.
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl p-4 space-y-4 custom-scrollbar">
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
                  : "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                m.sender === "user"
                  ? "bg-lime-400 text-black font-medium"
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
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold p-3 bg-zinc-900/60 rounded-2xl border border-cyan-400/20 w-max animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>AI Coach is thinking & analyzing your workout query...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-cyan-400/40 text-xs text-zinc-300 whitespace-nowrap transition"
          >
            💡 {qp}
          </button>
        ))}
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
