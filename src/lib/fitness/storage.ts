import type { CustomTargets, DayLog, UserProfile } from "./types";

const KEYS = {
  profile: "itstime.profile.v1",
  logs: "itstime.logs.v1",
  custom: "itstime.custom.v1",
  meals: "itstime.meals.v1",
  workouts: "itstime.workouts.v1",
} as const;

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("itstime:storage", { detail: { key: k } }));
}

export const storage = {
  getProfile: (): UserProfile | null => read<UserProfile | null>(KEYS.profile, null),
  setProfile: (p: UserProfile | null) => write(KEYS.profile, p),

  getLogs: (): Record<string, DayLog> => read(KEYS.logs, {}),
  setLogs: (l: Record<string, DayLog>) => write(KEYS.logs, l),
  upsertLog: (log: DayLog) => {
    const all = storage.getLogs();
    all[log.date] = { ...all[log.date], ...log };
    storage.setLogs(all);
  },

  getCustom: (): CustomTargets => read<CustomTargets>(KEYS.custom, {}),
  setCustom: (c: CustomTargets) => write(KEYS.custom, c),

  getMealsOverride: (): string | null => read<string | null>(KEYS.meals, null),
  setMealsOverride: (s: string | null) => write(KEYS.meals, s),

  getWorkoutsOverride: (): string | null => read<string | null>(KEYS.workouts, null),
  setWorkoutsOverride: (s: string | null) => write(KEYS.workouts, s),

  resetAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("itstime:storage", { detail: { key: "*" } }));
  },
};

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}