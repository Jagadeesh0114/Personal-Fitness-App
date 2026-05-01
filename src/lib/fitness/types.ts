export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Goal = "fat_loss" | "muscle_gain" | "maintenance" | "recomposition";
export type Intensity = "light" | "medium" | "heavy";

export interface UserProfile {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  createdAt: string;
}

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  bmr: number;
  tdee: number;
  goalLabel: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  caloriesConsumed?: number;
  proteinG?: number;
  workoutDone?: boolean;
  intensity?: Intensity;
  bodyWeightKg?: number;
  notes?: string;
}

export interface CustomTargets {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatsG?: number;
}