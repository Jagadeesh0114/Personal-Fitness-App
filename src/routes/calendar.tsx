import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFitness, isDayCompleted, isDayMissed } from "@/hooks/use-fitness";
import { storage, todayKey } from "@/lib/fitness/storage";
import type { DayLog, Intensity } from "@/lib/fitness/types";
import { ChevronLeft, ChevronRight, X, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")(
  {
  component: CalendarPage,
});

function CalendarPage() {
  const { hydrated, profile, targets, logs } = useFitness();
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [view, setView] = useState<"month" | "week">("month");
  const [selected, setSelected] = useState<string | null>(null);
  const weekDays = buildWeek(new Date());

  if (!hydrated) return null;
  if (!profile || !targets) {
    return <AppShell><Empty msg="Complete onboarding first." /></AppShell>;
  }

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekStats = computeWeekStats(weekDays, logs, targets.calories, targets.proteinG);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      <p className="text-sm text-muted-foreground mt-1">Tap any day to log or edit details.</p>

      <div className="mt-4 inline-flex bg-secondary rounded-lg p-1">
        {(["month","week"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all", view === v ? "bg-background shadow text-foreground" : "text-muted-foreground")}>{v}</button>
        ))}
      </div>

      {view === "month" ? (
        <div className="mt-5 bg-gradient-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
            <div className="font-semibold">{monthLabel}</div>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <MonthGrid cursor={cursor} logs={logs} calTarget={targets.calories} proTarget={targets.proteinG} onPick={setSelected} />
          <Legend />
        </div>
      ) : (
        <div className="mt-5 bg-gradient-card border border-border rounded-2xl p-5">
          <div className="font-semibold mb-3">This week</div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const k = todayKey(d);
              const log = logs[k];
              const completed = isDayCompleted(log, targets.calories, targets.proteinG);
              const missed = isDayMissed(log, k);
              return (
                <button key={k} onClick={() => setSelected(k)} className={cn("aspect-square rounded-lg border text-center p-1 flex flex-col justify-between transition-all",
                  completed ? "bg-primary/15 border-primary text-primary" : missed ? "bg-destructive/10 border-destructive/40 text-destructive" : "border-border hover:border-primary/50")}>
                  <div className="text-[10px] uppercase opacity-70">{d.toLocaleDateString(undefined,{weekday:"short"})}</div>
                  <div className="text-lg font-semibold">{d.getDate()}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 bg-gradient-card border border-border rounded-2xl p-5">
        <div className="font-semibold mb-3">Weekly Summary</div>
        <div className="grid grid-cols-4 gap-3">
          <SummaryCell label="Avg calories" value={weekStats.avgCal ? Math.round(weekStats.avgCal) : "—"} />
          <SummaryCell label="Avg protein" value={weekStats.avgPro ? `${Math.round(weekStats.avgPro)}g` : "—"} />
          <SummaryCell label="Workout %" value={`${weekStats.workoutPct}%`} />
          <SummaryCell label="Avg water" value={weekStats.avgWater ? `${Math.round(weekStats.avgWater)}` : "—"} />
        </div>
      </div>

      {selected && (
        <DayEditor dateKey={selected} onClose={() => setSelected(null)} />
      )}
    </AppShell>
  );
}

function MonthGrid({ cursor, logs, calTarget, proTarget, onPick }: {
  cursor: Date; logs: Record<string, DayLog>; calTarget: number; proTarget: number; onPick: (k: string) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // start Mon
  const cells: Date[] = [];
  const c = new Date(start);
  for (let i = 0; i < 42; i++) { cells.push(new Date(c)); c.setDate(c.getDate() + 1); }
  const todayK = todayKey();
  return (
    <div>
      <div className="grid grid-cols-7 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d) => {
          const k = todayKey(d);
          const log = logs[k];
          const inMonth = d.getMonth() === month;
          const completed = isDayCompleted(log, calTarget, proTarget);
          const missed = isDayMissed(log, k);
          const isToday = k === todayK;
          return (
            <button key={k} onClick={() => onPick(k)} className={cn(
              "aspect-square rounded-lg text-xs font-medium transition-all border",
              !inMonth && "opacity-30",
              completed ? "bg-primary border-primary text-primary-foreground font-bold shadow-glow" :
                missed ? "bg-destructive/10 border-destructive/30 text-destructive/80" :
                "border-border hover:border-primary/50",
              isToday && "ring-2 ring-primary/60",
            )}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary border border-primary" /> Completed</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-destructive/20 border border-destructive/40" /> Missed</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-border" /> Untracked</span>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function DayEditor({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const existing = storage.getLogs()[dateKey] ?? { date: dateKey };
  const [log, setLog] = useState<DayLog>(existing);

  const save = () => { storage.upsertLog(log); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5 animate-fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 shadow-elegant animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Edit log</div>
            <h3 className="text-xl font-semibold">{new Date(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <Field label="Calories consumed" value={log.caloriesConsumed} onChange={(v) => setLog({ ...log, caloriesConsumed: v })} />
          <Field label="Protein (g)" value={log.proteinG} onChange={(v) => setLog({ ...log, proteinG: v })} />
          <Field label="Body weight (kg)" value={log.bodyWeightKg} onChange={(v) => setLog({ ...log, bodyWeightKg: v })} step="0.1" />

          <div>
            <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><GlassWater className="h-3 w-3" /> Water (glasses)</div>
            <div className="flex items-center gap-2">
              <input type="number" inputMode="numeric" min="0" max="20" value={log.waterGlasses ?? ""} placeholder="8"
                onChange={(e) => setLog({ ...log, waterGlasses: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Workout</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setLog({ ...log, workoutDone: true })} className={cn("rounded-lg border py-2.5 text-sm transition-all", log.workoutDone === true ? "border-primary bg-primary/15 text-primary" : "border-border")}>Completed</button>
              <button onClick={() => setLog({ ...log, workoutDone: false })} className={cn("rounded-lg border py-2.5 text-sm transition-all", log.workoutDone === false ? "border-destructive bg-destructive/15 text-destructive" : "border-border")}>Skipped</button>
            </div>
        </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm">Cancel</button>
          <button onClick={save} className="flex-1 rounded-lg bg-gradient-primary text-primary-foreground py-2.5 text-sm font-medium shadow-glow">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step }: { label: string; value?: number; onChange: (v: number | undefined) => void; step?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <input type="number" inputMode="decimal" step={step ?? "1"} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-20 text-center text-muted-foreground">{msg}</div>;
}

function buildWeek(now: Date): Date[] {
  const d = new Date(now);
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x; });
}

function computeWeekStats(week: Date[], logs: Record<string, DayLog>, _cal: number, _pro: number) {
  const present = week.map((d) => logs[todayKey(d)]).filter(Boolean) as DayLog[];
  const avgCal = present.length ? present.reduce((s, l) => s + (l.caloriesConsumed ?? 0), 0) / present.length : 0;
  const avgPro = present.length ? present.reduce((s, l) => s + (l.proteinG ?? 0), 0) / present.length : 0;
  const workoutPct = week.length ? Math.round((present.filter((l) => l.workoutDone).length / week.length) * 100) : 0;
  const avgWater = present.length ? present.reduce((s, l) => s + (l.waterGlasses ?? 0), 0) / present.length : 0;
  return { avgCal, avgPro, workoutPct, avgWater };
}