import type { ActivityLevel, Gender, Goal, MacroTargets, UserProfile } from "./types";

export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const GOAL_LABEL: Record<Goal, string> = {
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  recomposition: "Recomposition Mode",
};

export function mifflinStJeor(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function computeTargets(p: UserProfile): MacroTargets {
  const bmr = mifflinStJeor(p.gender, p.weightKg, p.heightCm, p.age);
  const tdee = bmr * ACTIVITY_FACTOR[p.activity];

  let calories = tdee;
  let proteinPerKg = 1.8;
  let fatPctOfCals = 0.25;

  switch (p.goal) {
    case "fat_loss":
      calories = tdee * 0.775; // ~22.5% deficit
      proteinPerKg = 2.0;
      fatPctOfCals = 0.25;
      break;
    case "muscle_gain":
      calories = tdee * 1.125; // ~12.5% surplus
      proteinPerKg = 1.8;
      fatPctOfCals = 0.25;
      break;
    case "maintenance":
      calories = tdee;
      proteinPerKg = 1.8;
      fatPctOfCals = 0.28;
      break;
    case "recomposition":
      calories = tdee * 0.925; // ~7.5% deficit
      proteinPerKg = 2.2;
      fatPctOfCals = 0.25;
      break;
  }

  const proteinG = Math.round(proteinPerKg * p.weightKg);
  const fatsG = Math.round((calories * fatPctOfCals) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatsG * 9) / 4));

  return {
    calories: Math.round(calories),
    proteinG,
    carbsG,
    fatsG,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    goalLabel: GOAL_LABEL[p.goal],
  };
}

export function motivationalMessage(streak: number, goal: Goal): string {
  if (streak >= 30) return `${streak}-day streak. You are unstoppable.`;
  if (streak >= 14) return `${streak} days strong. Don't break the chain.`;
  if (streak >= 7) return `You're on a ${streak}-day streak.`;
  if (streak >= 3) return `${streak} days in a row. Keep showing up.`;
  if (streak === 0)
    return goal === "fat_loss"
      ? "Today is day one. Stay disciplined."
      : "Show up today. That's the whole job.";
  return "Stay consistent. Every day counts.";
}