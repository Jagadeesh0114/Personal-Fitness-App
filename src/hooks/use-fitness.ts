import { useCallback, useEffect, useState } from "react";
import { storage, todayKey } from "@/lib/fitness/storage";
import { computeTargets } from "@/lib/fitness/calculations";
import type { CustomTargets, DayLog, MacroTargets, UserProfile } from "@/lib/fitness/types";

export function useFitness() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [logs, setLogsState] = useState<Record<string, DayLog>>({});
  const [custom, setCustomState] = useState<CustomTargets>({});
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setProfileState(storage.getProfile());
    setLogsState(storage.getLogs());
    setCustomState(storage.getCustom());
    setHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("itstime:storage", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("itstime:storage", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const setProfile = (p: UserProfile | null) => { storage.setProfile(p); refresh(); };
  const upsertLog = (l: DayLog) => { storage.upsertLog(l); refresh(); };
  const setCustom = (c: CustomTargets) => { storage.setCustom(c); refresh(); };

  let baseTargets: MacroTargets | null = null;
  if (profile) baseTargets = computeTargets(profile);
  const targets: MacroTargets | null = baseTargets
    ? {
        ...baseTargets,
        calories: custom.calories ?? baseTargets.calories,
        proteinG: custom.proteinG ?? baseTargets.proteinG,
        carbsG: custom.carbsG ?? baseTargets.carbsG,
        fatsG: custom.fatsG ?? baseTargets.fatsG,
      }
    : null;

  return {
    hydrated,
    profile,
    logs,
    custom,
    targets,
    setProfile,
    upsertLog,
    setCustom,
    today: todayKey(),
  };
}

/** Returns current consecutive streak of "completed" days ending at most 1 day before today. */
export function computeStreak(logs: Record<string, DayLog>, calorieTarget: number, proteinTarget: number): number {
  let streak = 0;
  const d = new Date();
  // start from today, walk back
  for (let i = 0; i < 400; i++) {
    const key = todayKey(d);
    const log = logs[key];
    const completed = isDayCompleted(log, calorieTarget, proteinTarget);
    if (completed) {
      streak++;
    } else {
      // allow today to not yet be logged: only break if it's a past day
      if (i === 0) {
        // skip today if no log yet
      } else {
        break;
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function isDayCompleted(log: DayLog | undefined, calTarget: number, proTarget: number): boolean {
  if (!log) return false;
  const cal = log.caloriesConsumed ?? 0;
  const pro = log.proteinG ?? 0;
  const calOk = cal >= calTarget * 0.85 && cal <= calTarget * 1.15;
  const proOk = pro >= proTarget * 0.85;
  return calOk && proOk && !!log.workoutDone;
}

export function isDayMissed(log: DayLog | undefined, dateKey: string): boolean {
  if (dateKey >= todayKey()) return false;
  if (!log) return true;
  const hasAny = log.caloriesConsumed || log.proteinG || log.workoutDone || log.bodyWeightKg;
  return !hasAny;
}