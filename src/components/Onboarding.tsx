import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ActivityLevel, Gender, Goal, UserProfile } from "@/lib/fitness/types";
import { ArrowRight, ArrowLeft, Check, Sun, Moon } from "lucide-react";
import { storage, DEFAULT_SLEEP_SCHEDULE, getAllProfiles, setActiveUserId } from "@/lib/fitness/storage";
import { requestNotificationPermission, startAlarmService } from "@/lib/fitness/alarm";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import logo from "@/assets/logo.png";

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

const WAKE_OPTIONS = [
  { h: 5, label: "5 AM" },
  { h: 6, label: "6 AM" },
  { h: 7, label: "7 AM" },
  { h: 8, label: "8 AM" },
  { h: 9, label: "9 AM" },
];

const SLEEP_OPTIONS = [
  { h: 21, label: "9 PM" },
  { h: 22, label: "10 PM" },
  { h: 23, label: "11 PM" },
  { h: 0, label: "12 AM" },
  { h: 1, label: "1 AM" },
];

export function Onboarding({ onComplete }: Props) {
  const allProfiles = getAllProfiles();
  const [step, setStep] = useState(-1);
  const [loginMode, setLoginMode] = useState<"auth" | "login" | "signup">("auth");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [wakeHour, setWakeHour] = useState(7);
  const [sleepHour, setSleepHour] = useState(23);

  const total = 8; // added name step

  const canNext = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return !!gender;
      case 2: return Number(age) >= 12 && Number(age) <= 100;
      case 3: return Number(height) >= 120 && Number(height) <= 230;
      case 4: return Number(weight) >= 30 && Number(weight) <= 250;
      case 5: return !!activity;
      case 6: return !!goal;
      case 7: return true; // sleep schedule always valid
    }
    return false;
  };

  const next = async () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      // Save sleep schedule
      const schedule = {
        ...DEFAULT_SLEEP_SCHEDULE,
        wakeUpHour: wakeHour,
        wakeUpMinute: 0,
        sleepHour: sleepHour,
        sleepMinute: 0,
        alarmEnabled: true,
      };
      storage.setSleepSchedule(schedule);

      // Request notification permission for alarms
      await requestNotificationPermission();
      startAlarmService();

      onComplete({
        name: name.trim(),
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

  if (step === -1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10 animate-fade-in">
            <div className="mx-auto h-16 w-16 mb-6 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_35px_hsl(var(--primary))] ring-2 ring-primary/20">
              <img src={logo} alt="It's Time logo" className="h-full w-full object-cover scale-[1.25] object-center" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, It's Time</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to sync your progress.</p>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
            {loginMode === "auth" && (
              <>
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        const decoded: any = jwtDecode(credentialResponse.credential);
                        const googleId = `google_${decoded.sub}`;
                        setActiveUserId(googleId);
                        
                        const existingProfile = localStorage.getItem(`${googleId}.itstime.profile.v1`);
                        if (existingProfile) {
                          location.href = "/";
                        } else {
                          setName(decoded.name || "My Google Account");
                          setStep(1); // Skip name step
                        }
                      }
                    }}
                    onError={() => {
                      console.error("Google Login Failed");
                      alert("Google Login failed. Please try again or create a local account.");
                    }}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    width="320"
                  />
                </div>
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                </div>
                <button onClick={() => setLoginMode("login")} className="w-full px-4 py-3 rounded-xl border border-border bg-gradient-card font-medium transition-all hover:border-primary/50 shadow-sm">
                  Log in manually
                </button>
                <div className="text-center mt-4">
                  <button onClick={() => setLoginMode("signup")} className="text-sm text-primary hover:underline font-medium">Create a new account</button>
                </div>
              </>
            )}

            {loginMode === "login" && (
              <div className="space-y-3">
                <Input placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="h-12 bg-background border-border" />
                <Input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="h-12 bg-background border-border" onKeyDown={e => {
                  if (e.key === 'Enter') document.getElementById('login-btn')?.click();
                }}/>
                <button
                  id="login-btn"
                  onClick={() => {
                    const creds = localStorage.getItem(`itstime.auth.${authUsername.toLowerCase()}`);
                    if (creds && JSON.parse(creds).password === authPassword) {
                      setActiveUserId(JSON.parse(creds).id);
                      location.reload();
                    } else {
                      alert("Invalid username or password");
                    }
                  }}
                  className="w-full bg-gradient-primary shadow-glow text-primary-foreground font-semibold rounded-xl h-12 mt-2 transition-all"
                >
                  Log in
                </button>
                <div className="text-center mt-3">
                  <button onClick={() => setLoginMode("auth")} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
                </div>
              </div>
            )}

            {loginMode === "signup" && (
              <div className="space-y-3">
                <Input placeholder="Choose a Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="h-12 bg-background border-border" />
                <Input type="password" placeholder="Choose a Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="h-12 bg-background border-border" />
                <button
                  onClick={() => {
                    if (!authUsername || !authPassword) return alert("Please fill all fields");
                    if (localStorage.getItem(`itstime.auth.${authUsername.toLowerCase()}`)) return alert("Username already taken!");
                    
                    const newId = `local_${Date.now()}`;
                    localStorage.setItem(`itstime.auth.${authUsername.toLowerCase()}`, JSON.stringify({ password: authPassword, id: newId }));
                    setActiveUserId(newId);
                    setName(authUsername);
                    setStep(1); // Proceed straight to gender selection
                  }}
                  className="w-full bg-gradient-primary shadow-glow text-primary-foreground font-semibold rounded-xl h-12 mt-2 transition-all"
                >
                  Sign Up
                </button>
                <div className="text-center mt-3">
                  <button onClick={() => setLoginMode("auth")} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-11 w-11 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary))] ring-1 ring-primary/20">
              <img src={logo} alt="It's Time logo" className="h-full w-full object-cover scale-[1.25] object-center" />
            </div>
            <span className="text-2xl font-bold tracking-tight">It's Time</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your <span className="text-gradient">personal coach</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">A few quick questions. Then we build your plan.</p>
        </div>

        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-elegant animate-scale-in" key={step}>
          {step === 0 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 of {total}</Label>
              <h2 className="text-2xl font-semibold mt-1 mb-5">What's your name?</h2>
              <Input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg h-14 font-semibold bg-background border-border"
                placeholder="Enter your name"
                onKeyDown={(e) => { if (e.key === 'Enter' && canNext()) next(); }}
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 of {total}</Label>
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

          {step === 2 && (
            <NumStep label={`Step 3 of ${total}`} title="How old are you?" suffix="years" value={age} setValue={setAge} onEnter={() => { if(canNext()) next() }} />
          )}
          {step === 3 && (
            <NumStep label={`Step 4 of ${total}`} title="Your height" suffix="cm" value={height} setValue={setHeight} onEnter={() => { if(canNext()) next() }} />
          )}
          {step === 4 && (
            <NumStep label={`Step 5 of ${total}`} title="Your weight" suffix="kg" value={weight} setValue={setWeight} onEnter={() => { if(canNext()) next() }} />
          )}

          {step === 5 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 6 of {total}</Label>
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

          {step === 6 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 7 of {total}</Label>
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

          {step === 7 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Step 8 of {total}</Label>
              <h2 className="text-2xl font-semibold mt-1 mb-5">Your sleep schedule</h2>
              <p className="text-xs text-muted-foreground mb-4">
                We'll set alarms to keep your routine consistent. You can change these later in Settings.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-yellow-400" /> Wake-up time
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {WAKE_OPTIONS.map((opt) => (
                      <button
                        key={opt.h}
                        onClick={() => setWakeHour(opt.h)}
                        className={cn(
                          "rounded-lg border py-2.5 text-xs font-medium transition-all",
                          wakeHour === opt.h
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-indigo-400" /> Bedtime
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {SLEEP_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setSleepHour(opt.h)}
                        className={cn(
                          "rounded-lg border py-2.5 text-xs font-medium transition-all",
                          sleepHour === opt.h
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-center text-muted-foreground pt-2">
                  Sleep duration: <span className={cn("font-semibold", ((24 + wakeHour - sleepHour) % 24) >= 7 ? "text-primary" : "text-destructive")}>
                    {(24 + wakeHour - sleepHour) % 24} hours
                  </span>
                </div>
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