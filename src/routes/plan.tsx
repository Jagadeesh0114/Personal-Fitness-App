import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFitness } from "@/hooks/use-fitness";
import { buildMealPlan, buildWorkoutPlan } from "@/lib/fitness/plans";
import { storage } from "@/lib/fitness/storage";
import { cn } from "@/lib/utils";
import { ChefHat, Dumbbell, Pencil, Save, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/plan")(
  {
  component: PlanPage,
});

function PlanPage() {
  const { hydrated, profile, targets } = useFitness();
  const [tab, setTab] = useState<"meals" | "workout">("meals");
  const [editing, setEditing] = useState(false);
  const [mealsText, setMealsText] = useState<string>(() => storage.getMealsOverride() ?? "");
  const [workoutText, setWorkoutText] = useState<string>(() => storage.getWorkoutsOverride() ?? "");

  if (!hydrated) return null;
  if (!profile || !targets) return <AppShell><div className="py-20 text-center text-muted-foreground">Complete onboarding first.</div></AppShell>;

  const meals = buildMealPlan(targets);
  const workout = buildWorkoutPlan(profile.goal);
  const mealsOverride = storage.getMealsOverride();
  const workoutsOverride = storage.getWorkoutsOverride();

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">{targets.goalLabel} · {targets.calories} kcal · {targets.proteinG}g protein</p>
        </div>
      </div>

      <div className="mt-5 inline-flex bg-secondary rounded-lg p-1">
        {([["meals","Meals",ChefHat],["workout","Workouts",Dumbbell]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
            tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground")}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "meals" && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-end gap-2">
            {mealsOverride && (
              <button onClick={() => { storage.setMealsOverride(null); setMealsText(""); }} className="text-xs text-muted-foreground inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" />Reset</button>
            )}
            <button onClick={() => setEditing((v) => !v)} className="text-xs text-primary inline-flex items-center gap-1">
              {editing ? <><Save className="h-3 w-3" />Done</> : <><Pencil className="h-3 w-3" />Edit notes</>}
            </button>
          </div>

          {editing ? (
            <div className="bg-gradient-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground mb-2">Custom meal notes (replaces plan below)</div>
              <textarea
                rows={12}
                value={mealsText}
                onChange={(e) => setMealsText(e.target.value)}
                onBlur={() => storage.setMealsOverride(mealsText.trim() ? mealsText : null)}
                placeholder={"Breakfast: oats + 2 eggs + whey\nLunch: rice + 4 egg whites + salad\n..."}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          ) : mealsOverride ? (
            <div className="bg-gradient-card border border-border rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed">{mealsOverride}</div>
          ) : (
            meals.map((m) => (
              <div key={m.title} className="bg-gradient-card border border-border rounded-2xl p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-semibold">{m.title}</h3>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <ul className="space-y-2">
                  {m.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-muted-foreground">{it.amount}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-primary">{it.calories} kcal</div>
                        <div className="text-[10px] text-muted-foreground">{it.protein}g protein</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "workout" && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-end gap-2">
            {workoutsOverride && (
              <button onClick={() => { storage.setWorkoutsOverride(null); setWorkoutText(""); }} className="text-xs text-muted-foreground inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" />Reset</button>
            )}
            <button onClick={() => setEditing((v) => !v)} className="text-xs text-primary inline-flex items-center gap-1">
              {editing ? <><Save className="h-3 w-3" />Done</> : <><Pencil className="h-3 w-3" />Edit notes</>}
            </button>
          </div>

          {editing ? (
            <div className="bg-gradient-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground mb-2">Custom workout notes (replaces plan below)</div>
              <textarea
                rows={14}
                value={workoutText}
                onChange={(e) => setWorkoutText(e.target.value)}
                onBlur={() => storage.setWorkoutsOverride(workoutText.trim() ? workoutText : null)}
                placeholder={"Mon — Push: Bench 4x8, OHP 3x8...\nTue — Pull: Pull-ups 4x6, Row 4x8..."}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          ) : workoutsOverride ? (
            <div className="bg-gradient-card border border-border rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed">{workoutsOverride}</div>
          ) : (
            workout.map((d) => (
              <div key={d.day} className="bg-gradient-card border border-border rounded-2xl p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-semibold">{d.day}</h3>
                  <span className="text-xs text-primary">{d.focus}</span>
                </div>
                <ul className="space-y-1.5">
                  {d.exercises.map((e, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-xs text-muted-foreground">{e.sets} × {e.reps}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}