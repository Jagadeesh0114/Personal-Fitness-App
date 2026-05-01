export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Goal = "fat_loss" | "muscle_gain" | "maintenance" | "recomposition";
export type Intensity = "light" | "medium" | "heavy";

export interface UserProfile {
  id?: string;
  name?: string;
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
  waterGlasses?: number;
  notes?: string;
}

export interface CustomTargets {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatsG?: number;
}

export interface SleepSchedule {
  wakeUpHour: number;   // 0-23 (e.g. 7 for 7 AM)
  wakeUpMinute: number; // 0-59
  sleepHour: number;    // 0-23 (e.g. 23 for 11 PM)
  sleepMinute: number;  // 0-59
  alarmEnabled: boolean;
  daysEnabled: number[]; // 0=Sun, 1=Mon ... 6=Sat
}