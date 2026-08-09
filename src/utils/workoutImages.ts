export const WORKOUT_IMAGES: Record<string, string> = {
  chest_shoulder: "https://cdn.phototourl.com/free/2026-08-08-e08acc05-8ea6-4c26-97a4-eab4ba20b233.webp",
  legs: "https://cdn.phototourl.com/free/2026-08-08-f7a0fbb8-9e61-4214-9fdd-61ec004ac860.webp",
  cardio_abs: "https://cdn.phototourl.com/free/2026-08-08-916315f0-450f-441c-94d8-f9d89127a9eb.webp",
  biceps_triceps: "https://cdn.phototourl.com/free/2026-08-09-6935c3c5-00cf-4b14-b2c7-b26cec3c1236.webp",
  neck: "https://cdn.phototourl.com/free/2026-08-08-364f8209-65dc-4837-85c7-9d799ffc47c4.webp",
  back: "https://cdn.phototourl.com/free/2026-08-08-46b612d5-7d67-430b-9eee-33238716fb49.webp",
};

/**
 * Returns the corresponding visual workout image URL based on the workout name
 * or target muscle groups.
 */
export function getWorkoutImage(workoutName: string = "", muscleGroups: string[] = []): string {
  const nameStr = workoutName.toLowerCase();
  const muscleStr = muscleGroups.join(" ").toLowerCase();
  const combined = `${nameStr} ${muscleStr}`;

  if (combined.includes("chest") || combined.includes("shoulder")) {
    return WORKOUT_IMAGES.chest_shoulder;
  }
  if (
    combined.includes("leg") ||
    combined.includes("quad") ||
    combined.includes("hamstring") ||
    combined.includes("calf") ||
    combined.includes("glute")
  ) {
    return WORKOUT_IMAGES.legs;
  }
  if (combined.includes("cardio") || combined.includes("ab") || combined.includes("core")) {
    return WORKOUT_IMAGES.cardio_abs;
  }
  if (combined.includes("bicep") || combined.includes("tricep") || combined.includes("arm")) {
    return WORKOUT_IMAGES.biceps_triceps;
  }
  if (combined.includes("neck") || combined.includes("trap")) {
    return WORKOUT_IMAGES.neck;
  }
  if (combined.includes("back") || combined.includes("lat")) {
    return WORKOUT_IMAGES.back;
  }

  // Default fallback
  return WORKOUT_IMAGES.chest_shoulder;
}
