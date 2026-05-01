import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFitness } from "@/hooks/use-fitness";
import { storage } from "@/lib/fitness/storage";
import { computeTargets, GOAL_LABEL } from "@/lib/fitness/calculations";
import type { ActivityLevel, Goal, UserProfile } from "@/lib/fitness/types";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — It's Time" },
      { name: "description", content: "Adjust your stats, goal, and calorie targets." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { hydrated, profile, custom, targets, setProfile, setCustom } = useFitness();
  const [draft, setDraft] = useState<UserProfile | null>(profile);

  if (!hydrated) return null;
  if (!profile || !targets) return <AppShell><div className="py-20 text-center text-muted-foreground">Complete onboarding first.</div></AppShell>;

  const d = draft ?? profile;
  const computed = computeTargets(d);

  const update = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => setDraft({ ...d, [k]: v });
  const save = () => { if (draft) setProfile(draft); };
  const reset = () => { if (confirm("Reset all data? This cannot be undone.")) { storage.resetAll(); location.reload(); } };

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Adjust your profile, goal, and macros.</p>

      <section className="mt-6 bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold">Your stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Gender" value={d.gender} options={[["male","Male"],["female","Female"]]} onChange={(v) => update("gender", v as UserProfile["gender"])} />
          <Num label="Age" value={d.age} onChange={(v) => update("age", v)} />
          <Num label="Height (cm)" value={d.heightCm} onChange={(v) => update("heightCm", v)} />
          <Num label="Weight (kg)" value={d.weightKg} onChange={(v) => update("weightKg", v)} step="0.1" />
        </div>
        <Select label="Activity" value={d.activity} options={[["sedentary","Sedentary"],["light","Light"],["moderate","Moderate"],["active","Active"]]} onChange={(v) => update("activity", v as ActivityLevel)} />
        <Select label="Goal" value={d.goal} options={(Object.keys(GOAL_LABEL) as Goal[]).map((g) => [g, GOAL_LABEL[g]])} onChange={(v) => update("goal", v as Goal)} />
        <div className="text-xs text-muted-foreground">Recomputed: {computed.calories} kcal · {computed.proteinG}g protein</div>
        <button onClick={save} className="w-full rounded-lg bg-gradient-primary text-primary-foreground py-2.5 text-sm font-medium shadow-glow">Save profile</button>
      </section>

      <section className="mt-5 bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold">Custom targets</h2>
        <p className="text-xs text-muted-foreground">Override calculated values. Leave blank to use the formula.</p>
        <div className="grid grid-cols-2 gap-3">
          <Num label="Calories" value={custom.calories} onChange={(v) => setCustom({ ...custom, calories: v })} />
          <Num label="Protein (g)" value={custom.proteinG} onChange={(v) => setCustom({ ...custom, proteinG: v })} />
          <Num label="Carbs (g)" value={custom.carbsG} onChange={(v) => setCustom({ ...custom, carbsG: v })} />
          <Num label="Fats (g)" value={custom.fatsG} onChange={(v) => setCustom({ ...custom, fatsG: v })} />
        </div>
      </section>

      <section className="mt-5 bg-gradient-card border border-destructive/30 rounded-2xl p-5">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <p className="text-xs text-muted-foreground mt-1">Wipe all profile data, logs and customizations.</p>
        <button onClick={reset} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-destructive/50 text-destructive px-4 py-2 text-sm hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Reset everything
        </button>
      </section>
    </AppShell>
  );
}

function Num({ label, value, onChange, step }: { label: string; value?: number; onChange: (v: number | undefined) => void; step?: string }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <input type="number" step={step ?? "1"} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
    </label>
  );
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}