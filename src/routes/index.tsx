import { createFileRoute } from "@tanstack/react-router";
import { useFitness, computeStreak, isDayCompleted } from "@/hooks/use-fitness";
import { AppShell } from "@/components/AppShell";
import { Onboarding } from "@/components/Onboarding";
import { SleepScheduleCard } from "@/components/SleepSchedule";
import { motivationalMessage } from "@/lib/fitness/calculations";
import { Flame, Target, Beef, Wheat, Droplet, AlertTriangle, TrendingUp, GlassWater } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { DayLog, Intensity } from "@/lib/fitness/types";
import { useEffect, useState } from "react";
import { startAlarmService } from "@/lib/fitness/alarm";

export const Route = createFileRoute("/")(
  {
  component: Index,
});

function Index() {
  const { hydrated, profile, targets, logs, today, setProfile, upsertLog } = useFitness();
  const [showCongrats, setShowCongrats] = useState(false);

  // Start alarm service when dashboard mounts
  useEffect(() => {
    startAlarmService();
  }, []);

  if (!hydrated) return null;
  if (!profile || !targets) return <Onboarding onComplete={setProfile} />;

  const todayLog: DayLog = logs[today] ?? { date: today };
  const streak = computeStreak(logs, targets.calories, targets.proteinG);
  const message = motivationalMessage(streak, profile.goal);

  const calPct = Math.min(100, Math.round(((todayLog.caloriesConsumed ?? 0) / targets.calories) * 100));
  const proPct = Math.min(100, Math.round(((todayLog.proteinG ?? 0) / targets.proteinG) * 100));

  // Smart flags from last 7 days
  const flags = computeFlags(logs, targets.calories, targets.proteinG);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <section className="animate-slide-up">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{greeting}{profile.name ? `, ${profile.name}` : ""}</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">{message}</h1>
        <div className="mt-2 inline-flex items-center gap-2 text-sm text-primary">
          <Flame className="h-4 w-4" /> {streak}-day streak · {targets.goalLabel}
        </div>
      </section>

      <section className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BigStat
          label="Daily Calories"
          value={targets.calories}
          unit="kcal"
          icon={<Target className="h-5 w-5" />}
          progress={calPct}
          consumed={todayLog.caloriesConsumed}
        />
        <BigStat
          label="Protein Target"
          value={targets.proteinG}
          unit="g"
          icon={<Beef className="h-5 w-5" />}
          progress={proPct}
          consumed={todayLog.proteinG}
        />
      </section>

      <section className="mt-3 grid grid-cols-3 gap-3">
        <SmallStat label="Carbs" value={targets.carbsG} unit="g" icon={<Wheat className="h-4 w-4" />} />
        <SmallStat label="Fats" value={targets.fatsG} unit="g" icon={<Droplet className="h-4 w-4" />} />
        <SmallStat label="Water" value={todayLog.waterGlasses ?? 0} unit="glasses" icon={<GlassWater className="h-4 w-4" />} />
      </section>

      <section className="mt-5">
        <SleepScheduleCard />
      </section>

      <section className="mt-5 bg-gradient-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's log</h2>
          <span className="text-xs text-muted-foreground">{today}</span>
        </div>
        <QuickLog
          log={todayLog}
          onSave={(l) => upsertLog({ ...l, date: today })}
          target={targets.calories}
          proTarget={targets.proteinG}
          onWorkoutDone={() => setShowCongrats(true)}
        />
      </section>

      {flags.length > 0 && (
        <section className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Coach flags
          </h3>
          {flags.map((f) => (
            <div key={f} className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">{f}</div>
          ))}
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/plan" className="rounded-xl border border-border bg-gradient-card p-4 hover:border-primary/50 transition-colors">
          <TrendingUp className="h-4 w-4 text-primary mb-2" />
          <div className="text-sm font-medium">View plan</div>
          <div className="text-xs text-muted-foreground">Meals & workouts</div>
        </Link>
        <Link to="/calendar" className="rounded-xl border border-border bg-gradient-card p-4 hover:border-primary/50 transition-colors">
          <Flame className="h-4 w-4 text-primary mb-2" />
          <div className="text-sm font-medium">Calendar</div>
          <div className="text-xs text-muted-foreground">Track consistency</div>
        </Link>
      </section>

      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-gradient-card border border-primary/50 rounded-2xl p-6 text-center shadow-glow animate-scale-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <span className="text-3xl">🔥</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Incredible Work!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You crushed your workout today. Keep showing up, you're building an unstoppable habit.
            </p>
            <button
              onClick={() => setShowCongrats(false)}
              className="mt-6 w-full rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
            >
              Let's go!
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function BigStat({ label, value, unit, icon, progress, consumed }: {
  label: string; value: number; unit: string; icon: React.ReactNode; progress: number; consumed?: number;
}) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-elegant">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight">{value.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {consumed ? `${consumed.toLocaleString()} ${unit} logged today` : "Not logged yet"}
      </div>
    </div>
  );
}

function SmallStat({ label, value, unit, icon }: { label: string; value: number; unit: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gradient-card border border-border rounded-xl p-4">
      <div className="text-muted-foreground text-xs flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span></div>
    </div>
  );
}

function QuickLog({ log, onSave, target, proTarget, onWorkoutDone }: { log: DayLog; onSave: (l: DayLog) => void; target: number; proTarget: number; onWorkoutDone: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberField label="Calories" value={log.caloriesConsumed} onChange={(v) => onSave({ ...log, caloriesConsumed: v })} placeholder={String(target)} />
      <NumberField label="Protein (g)" value={log.proteinG} onChange={(v) => onSave({ ...log, proteinG: v })} placeholder={String(proTarget)} />
      <NumberField label="Body weight (kg)" value={log.bodyWeightKg} onChange={(v) => onSave({ ...log, bodyWeightKg: v })} placeholder="—" step="0.1" />
      <NumberField label="Water (glasses)" value={log.waterGlasses} onChange={(v) => onSave({ ...log, waterGlasses: v })} placeholder="8" />
      <div className="col-span-2">
        <div className="text-xs text-muted-foreground mb-1">Workout</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              if (!log.workoutDone) onWorkoutDone();
              onSave({ ...log, workoutDone: true, intensity: log.intensity ?? "medium" });
            }}
            className={`rounded-lg border text-xs py-2.5 transition-all ${log.workoutDone ? "border-primary bg-primary/15 text-primary" : "border-border"}`}
          >
            Done
          </button>
          <button onClick={() => onSave({ ...log, workoutDone: false })} className={`rounded-lg border text-xs py-2.5 transition-all ${log.workoutDone === false ? "border-destructive bg-destructive/15 text-destructive" : "border-border"}`}>Rest</button>
        </div>
        {log.workoutDone && (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1.5">Intensity</div>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "medium", "heavy"] as Intensity[]).map((i) => (
                <button
                  key={i}
                  onClick={() => onSave({ ...log, intensity: i })}
                  className={`rounded-lg border py-2 text-xs capitalize transition-all ${log.intensity === i ? "border-primary bg-primary/15 text-primary" : "border-border"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder, step }: {
  label: string; value?: number; onChange: (v: number | undefined) => void; placeholder: string; step?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? "1"}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : Number(v));
        }}
        className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

function computeFlags(logs: Record<string, DayLog>, calTarget: number, proTarget: number): string[] {
  const flags: string[] = [];
  const days: DayLog[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  for (let i = 0; i < 7; i++) {
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (logs[k]) days.push(logs[k]);
    d.setDate(d.getDate() - 1);
  }
  if (days.length === 0) return flags;
  const avgPro = days.reduce((s, d) => s + (d.proteinG ?? 0), 0) / days.length;
  if (avgPro < proTarget * 0.8) flags.push(`Protein too low — averaging ${Math.round(avgPro)}g vs target ${proTarget}g.`);
  const missedWorkouts = days.filter((d) => !d.workoutDone).length;
  if (missedWorkouts >= 4) flags.push(`Missed workouts — only ${days.length - missedWorkouts}/${days.length} sessions done.`);
  if (days.length < 4) flags.push("Inconsistent tracking — log every day to stay accountable.");
  // Check water intake
  const avgWater = days.reduce((s, d) => s + (d.waterGlasses ?? 0), 0) / days.length;
  if (avgWater < 4 && days.some(d => d.waterGlasses !== undefined)) flags.push(`Low hydration — averaging ${Math.round(avgWater)} glasses/day. Aim for 8+.`);
  // satisfy linter: completion check available
  void isDayCompleted; void calTarget;
  return flags;
}
