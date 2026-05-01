import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ActivityLevel, Gender, Goal, UserProfile } from "@/lib/fitness/types";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface Props {
  onComplete: (p: UserProfile) => void;
}

const activities: { id: ActivityLevel; title: string; desc: string }[] = [
  { id: "sedentary", title: "Sedentary", desc: "Desk job, little to no exercise" },
  { id: "light", title: "Light", desc: "Light exercise 1–3x / week" },
  { id: "moderate", title: "Moderate", desc: "Exercise 3–5x / week" },
  { id: "active", title: "Active", desc: "Hard exercise 6–7x / week" },
];

const goals: { id: Goal; title: string; desc: string }[] = [
  { id: "fat_loss", title: "Fat Loss", desc: "Lean down, keep muscle" },
  { id: "muscle_gain", title: "Muscle Gain", desc: "Build size with a surplus" },
  { id: "maintenance", title: "Maintenance", desc: "Hold your current shape" },
  { id: "recomposition", title: "Recomposition Mode", desc: "Lose fat & gain muscle" },
];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const total = 6;

  const canNext = () => {
    switch (step) {
      case 0: return !!gender;
      case 1: return Number(age) >= 12 && Number(age) <= 100;
      case 2: return Number(height) >= 120 && Number(height) <= 230;
      case 3: return Number(weight) >= 30 && Number(weight) <= 250;
      case 4: return !!activity;
      case 5: return !!goal;
    }
    return false;
  };

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else {
      onComplete({
        gender: gender!,
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
        activity: activity!,
        goal: goal!,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow grid place-items-center text-primary-foreground font-bold">IT</span>
            <span className="text-xl font-semibold tracking-tight">It's Time</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your <span className="text-gradient">personal coach</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">A few quick questions. Then we build your plan.</p>
        </div>

        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-elegant animate-scale-in" key={step}>
          {step === 0 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 of 6</Label>
              <h2 className="text-2xl font-semibold mt-1 mb-5">What's your gender?</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "rounded-xl border p-5 text-left capitalize transition-all",
                      gender === g ? "border-primary bg-primary/10 shadow-glow" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="font-medium">{g}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <NumStep label="Step 2 of 6" title="How old are you?" suffix="years" value={age} setValue={setAge} />
          )}
          {step === 2 && (
            <NumStep label="Step 3 of 6" title="Your height" suffix="cm" value={height} setValue={setHeight} />
          )}
          {step === 3 && (
            <NumStep label="Step 4 of 6" title="Your weight" suffix="kg" value={weight} setValue={setWeight} />
          )}

          {step === 4 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 5 of 6</Label>
              <h2 className="text-2xl font-semibold mt-1 mb-5">Activity level</h2>
              <div className="space-y-2">
                {activities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActivity(a.id)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between",
                      activity === a.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                    </div>
                    {activity === a.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 6 of 6</Label>
              <h2 className="text-2xl font-semibold mt-1 mb-5">Choose your goal</h2>
              <div className="space-y-2">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between",
                      goal === g.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{g.desc}</div>
                    </div>
                    {goal === g.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={next} disabled={!canNext()} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            {step === total - 1 ? "Build my plan" : "Continue"} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NumStep({ label, title, suffix, value, setValue }: {
  label: string; title: string; suffix: string; value: string; setValue: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <h2 className="text-2xl font-semibold mt-1 mb-5">{title}</h2>
      <div className="relative">
        <Input
          type="number"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-3xl h-16 pr-16 font-semibold bg-background border-border"
          placeholder="0"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}