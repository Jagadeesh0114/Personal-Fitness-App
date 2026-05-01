import type { CustomTargets, DayLog, SleepSchedule, UserProfile } from "./types";

const GLOBAL_KEYS = {
  activeUserId: "itstime.activeUserId.v1",
} as const;

const LOCAL_KEYS = {
  profile: "itstime.profile.v1",
  logs: "itstime.logs.v1",
  custom: "itstime.custom.v1",
  meals: "itstime.meals.v1",
  workouts: "itstime.workouts.v1",
  sleep: "itstime.sleep.v1",
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

export const DEFAULT_SLEEP_SCHEDULE: SleepSchedule = {
  wakeUpHour: 7,
  wakeUpMinute: 0,
  sleepHour: 23,
  sleepMinute: 0,
  alarmEnabled: true,
  daysEnabled: [0, 1, 2, 3, 4, 5, 6],
};

export function getActiveUserId(): string {
  return read(GLOBAL_KEYS.activeUserId, "default");
}

export function setActiveUserId(uid: string) {
  write(GLOBAL_KEYS.activeUserId, uid);
  // Dispatch a wildcard so hooks reload
  window.dispatchEvent(new CustomEvent("itstime:storage", { detail: { key: "*" } }));
}

function getUserKey(baseKey: string): string {
  const uid = getActiveUserId();
  return uid === "default" ? baseKey : `${uid}.${baseKey}`;
}

export function getAllProfiles(): UserProfile[] {
  if (typeof window === "undefined") return [];
  const profiles: UserProfile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.endsWith(LOCAL_KEYS.profile)) {
      const p = read<UserProfile | null>(k, null);
      if (p) profiles.push(p);
    }
  }
  return profiles;
}

export const storage = {
  getProfile: (): UserProfile | null => read<UserProfile | null>(getUserKey(LOCAL_KEYS.profile), null),
  setProfile: (p: UserProfile | null) => {
    if (p && !p.id) p.id = getActiveUserId(); // Ensure ID is present
    write(getUserKey(LOCAL_KEYS.profile), p);
  },

  getLogs: (): Record<string, DayLog> => read(getUserKey(LOCAL_KEYS.logs), {}),
  setLogs: (l: Record<string, DayLog>) => write(getUserKey(LOCAL_KEYS.logs), l),
  upsertLog: (log: DayLog) => {
    const all = storage.getLogs();
    all[log.date] = { ...all[log.date], ...log };
    storage.setLogs(all);
  },

  getCustom: (): CustomTargets => read<CustomTargets>(getUserKey(LOCAL_KEYS.custom), {}),
  setCustom: (c: CustomTargets) => write(getUserKey(LOCAL_KEYS.custom), c),

  getMealsOverride: (): string | null => read<string | null>(getUserKey(LOCAL_KEYS.meals), null),
  setMealsOverride: (s: string | null) => write(getUserKey(LOCAL_KEYS.meals), s),

  getWorkoutsOverride: (): string | null => read<string | null>(getUserKey(LOCAL_KEYS.workouts), null),
  setWorkoutsOverride: (s: string | null) => write(getUserKey(LOCAL_KEYS.workouts), s),

  getSleepSchedule: (): SleepSchedule => read<SleepSchedule>(getUserKey(LOCAL_KEYS.sleep), DEFAULT_SLEEP_SCHEDULE),
  setSleepSchedule: (s: SleepSchedule) => write(getUserKey(LOCAL_KEYS.sleep), s),

  resetAll: () => {
    const prefix = getActiveUserId() === "default" ? "" : `${getActiveUserId()}.`;
    Object.values(LOCAL_KEYS).forEach((k) => {
      const fullKey = prefix ? `${prefix}${k}` : k;
      localStorage.removeItem(fullKey);
    });
    window.dispatchEvent(new CustomEvent("itstime:storage", { detail: { key: "*" } }));
  },
};

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}