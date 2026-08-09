export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Legs"
  | "Glutes"
  | "Abs"
  | "Neck"
  | "Cardio"
  | "Full Body";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type FitnessGoal =
  | "Muscle Building"
  | "Strength Training"
  | "Weight Loss"
  | "Endurance"
  | "Muscle Gain"
  | "Fat Loss"
  | "Strength"
  | "Bodybuilding"
  | "General Fitness";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type WeightUnit = "KG" | "LB" | "kg" | "lbs";

export type EquipmentType =
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Kettlebell"
  | "Bands"
  | "Cardio Equipment";

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: ExperienceLevel;
  defaultSets: number;
  defaultReps: number | string;
  defaultRestSec: number;
  instructions: string;
  safetyTips: string;
  imageUrl?: string;
  isCustom?: boolean;
}

export interface SetData {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  previousWeightKg?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string; // unique ID in this workout session/plan
  exerciseId: string; // references ExerciseItem
  name: string;
  targetMuscle: MuscleGroup;
  setsCount: number;
  targetReps: string; // e.g. "8-10" or "12"
  weightKg: number;
  restSec: number;
  notes?: string;
  tempo?: string; // e.g. "3-0-1-0"
  imageUrl?: string;
  sets: SetData[];
  completed?: boolean;
}

export interface WorkoutPlan {
  day: DayOfWeek;
  workoutName: string; // e.g., "Chest + Shoulder"
  muscleGroups: MuscleGroup[];
  isRestDay: boolean;
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
  customImageUrl?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek?: DayOfWeek;
  dayName?: string;
  workoutName: string;
  muscleGroups?: MuscleGroup[];
  durationMinutes: number;
  exercisesCompletedCount?: number;
  totalExercisesCount?: number;
  totalSetsCompleted?: number;
  totalVolumeKg: number;
  prsAchieved?: number;
  notes?: string;
  completedExercises?: WorkoutExercise[];
  exercises?: {
    name: string;
    targetMuscle: MuscleGroup;
    sets: { weightKg: number; reps: number; completed: boolean }[];
  }[];
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  maxWeightKg: number;
  maxRepsAtMaxWeight: number;
  bestSetVolumeKg: number;
  dateAchieved: string; // YYYY-MM-DD
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  shouldersCm?: number;
}

export interface ReminderSetting {
  id: string;
  enabled: boolean;
  time: string; // e.g. "19:00" or "07:00"
  days: (DayOfWeek | string)[];
  label: string; // e.g. "Evening Gym Reminder"
}

export type ReminderItem = ReminderSetting;

export interface RingtoneOption {
  id: string;
  name: string;
  type?: "built-in" | "custom";
  synthTone?: "metal_bell" | "gym_horn" | "beep_pulse" | "synth_drop" | "classic_alarm";
  dataUrl?: string; // for user uploaded file
}

export type RingtonePreset = RingtoneOption;

export interface NotificationPreferences {
  workoutRemindersEnabled: boolean;
  reminderRingtoneId: string;
  volume?: number;
  alarmVolume: number; // 0 to 1
  vibrationEnabled: boolean;
  reminderDurationSec: number;
  snoozeMinutes: number;
  reminders: ReminderSetting[];
  selectedRingtone?: string;
  customAudioUrl?: string;
  customAudioFileName?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  goal?: FitnessGoal;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  weightUnit?: "KG" | "LB";
  preferredUnit: WeightUnit;
  preferredWorkoutDurationMin?: number;
  streakDays: number;
  totalWorkouts: number;
  joinedDate?: string;
  lastWorkoutDate?: string;
  defaultRestTimerSec: number;
  autoWorkoutModeEnabled?: boolean;
  onboardingCompleted?: boolean;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export type AppTab =
  | "dashboard"
  | "workouts"
  | "library"
  | "timers"
  | "progress"
  | "prs"
  | "calendar"
  | "ai"
  | "reminders"
  | "settings";
