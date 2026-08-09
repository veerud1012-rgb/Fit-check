import React from "react";

interface MuscleDiagramProps {
  highlightedMuscles?: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  highlightedMuscles = ["Chest", "Shoulders"],
  className = "",
  size = "md",
}) => {
  const isChest = highlightedMuscles.some((m) =>
    ["chest", "pecs"].includes(m.toLowerCase())
  );
  const isShoulders = highlightedMuscles.some((m) =>
    ["shoulders", "delts", "delt"].includes(m.toLowerCase())
  );
  const isArms = highlightedMuscles.some((m) =>
    ["arms", "biceps", "triceps"].includes(m.toLowerCase())
  );
  const isAbs = highlightedMuscles.some((m) =>
    ["abs", "core", "waist"].includes(m.toLowerCase())
  );
  const isLegs = highlightedMuscles.some((m) =>
    ["legs", "quads", "hamstrings", "calves"].includes(m.toLowerCase())
  );

  const dimensions = {
    sm: "w-16 h-20",
    md: "w-24 h-28",
    lg: "w-32 h-36",
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center p-2 rounded-2xl bg-zinc-900/90 border border-white/10 ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body Base Contour (Gray Neutral Silhouette) */}
        {/* Head */}
        <circle cx="50" cy="14" r="8" fill="#3f3f46" stroke="#27272a" strokeWidth="1" />
        
        {/* Neck */}
        <path d="M46 21 H54 V26 H46 Z" fill="#3f3f46" />

        {/* Traps & Collar */}
        <path d="M38 27 L50 24 L62 27 L66 32 L34 32 Z" fill="#3f3f46" />

        {/* Chest (Pectorals) */}
        <path
          d="M38 33 H62 V47 C62 50 56 52 50 52 C44 52 38 50 38 47 Z"
          fill={isChest ? "#a3e635" : "#3f3f46"}
          stroke={isChest ? "#bef264" : "#27272a"}
          strokeWidth="1.5"
          className={isChest ? "filter drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" : ""}
        />
        {/* Chest Split Line */}
        <line x1="50" y1="33" x2="50" y2="51" stroke={isChest ? "#15803d" : "#27272a"} strokeWidth="1" />

        {/* Shoulders (Deltoids) Left & Right */}
        <path
          d="M32 28 C28 30 26 36 28 42 L36 34 Z"
          fill={isShoulders ? "#a3e635" : "#3f3f46"}
          stroke={isShoulders ? "#bef264" : "#27272a"}
          strokeWidth="1.5"
          className={isShoulders ? "filter drop-shadow-[0_0_6px_rgba(163,230,53,0.8)]" : ""}
        />
        <path
          d="M68 28 C72 30 74 36 72 42 L64 34 Z"
          fill={isShoulders ? "#a3e635" : "#3f3f46"}
          stroke={isShoulders ? "#bef264" : "#27272a"}
          strokeWidth="1.5"
          className={isShoulders ? "filter drop-shadow-[0_0_6px_rgba(163,230,53,0.8)]" : ""}
        />

        {/* Abs / Core */}
        <path
          d="M40 53 H60 V70 H40 Z"
          fill={isAbs ? "#a3e635" : "#3f3f46"}
          stroke="#27272a"
          strokeWidth="1"
        />
        {/* 6-pack grid lines */}
        <line x1="50" y1="53" x2="50" y2="70" stroke="#27272a" strokeWidth="1" />
        <line x1="42" y1="58" x2="58" y2="58" stroke="#27272a" strokeWidth="1" />
        <line x1="42" y1="64" x2="58" y2="64" stroke="#27272a" strokeWidth="1" />

        {/* Arms (Biceps/Forearms) */}
        <path
          d="M26 42 L22 56 C21 62 23 68 25 72 L30 70 L30 52 Z"
          fill={isArms ? "#a3e635" : "#3f3f46"}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M74 42 L78 56 C79 62 77 68 75 72 L70 70 L70 52 Z"
          fill={isArms ? "#a3e635" : "#3f3f46"}
          stroke="#27272a"
          strokeWidth="1"
        />

        {/* Legs (Quads) */}
        <path
          d="M39 72 L36 100 L47 100 L49 72 Z"
          fill={isLegs ? "#a3e635" : "#3f3f46"}
          stroke="#27272a"
          strokeWidth="1"
        />
        <path
          d="M61 72 L64 100 L53 100 L51 72 Z"
          fill={isLegs ? "#a3e635" : "#3f3f46"}
          stroke="#27272a"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
