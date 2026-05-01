import { useState, useEffect, useCallback } from "react";
import { storage, DEFAULT_SLEEP_SCHEDULE } from "@/lib/fitness/storage";
import { formatTime, getTimeUntilNextAlarm, requestNotificationPermission, startAlarmService, playAlarmSound } from "@/lib/fitness/alarm";
import type { SleepSchedule } from "@/lib/fitness/types";
import { Sun, Moon, Bell, BellOff, Clock, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WAKE_OPTIONS = [
  { h: 5, m: 0, label: "5:00 AM" },
  { h: 6, m: 0, label: "6:00 AM" },
  { h: 7, m: 0, label: "7:00 AM" },
  { h: 8, m: 0, label: "8:00 AM" },
  { h: 9, m: 0, label: "9:00 AM" },
];

const SLEEP_OPTIONS = [
  { h: 21, m: 0, label: "9:00 PM" },
  { h: 22, m: 0, label: "10:00 PM" },
  { h: 23, m: 0, label: "11:00 PM" },
  { h: 0, m: 0, label: "12:00 AM" },
  { h: 1, m: 0, label: "1:00 AM" },
];

function getSleepDuration(schedule: SleepSchedule): number {
  let wakeMin = schedule.wakeUpHour * 60 + schedule.wakeUpMinute;
  let sleepMin = schedule.sleepHour * 60 + schedule.sleepMinute;
  if (sleepMin >= wakeMin) {
    // Sleep is after wake, so sleep duration wraps overnight
    return (24 * 60 - sleepMin) + wakeMin;
  }
  return wakeMin - sleepMin;
}

export function SleepScheduleCard() {
  const [schedule, setSchedule] = useState<SleepSchedule>(() => storage.getSleepSchedule());
  const [nextAlarm, setNextAlarm] = useState<ReturnType<typeof getTimeUntilNextAlarm>>(null);

  useEffect(() => {
    const update = () => setNextAlarm(getTimeUntilNextAlarm(schedule));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [schedule]);

  useEffect(() => {
    startAlarmService();
  }, []);

  const sleepHours = Math.round(getSleepDuration(schedule) / 60 * 10) / 10;

  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Sleep Schedule</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const newSchedule = { ...schedule, alarmEnabled: !schedule.alarmEnabled };
              setSchedule(newSchedule);
              storage.setSleepSchedule(newSchedule);
              if (newSchedule.alarmEnabled) {
                await requestNotificationPermission();
                startAlarmService();
              }
            }}
            className={cn(
              "h-8 w-8 rounded-lg grid place-items-center transition-all",
              schedule.alarmEnabled
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {schedule.alarmEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Sun className="h-3.5 w-3.5 text-yellow-400" /> Wake Up
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {formatTime(schedule.wakeUpHour, schedule.wakeUpMinute)}
          </div>
        </div>
        <div className="bg-background/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Moon className="h-3.5 w-3.5 text-indigo-400" /> Bedtime
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {formatTime(schedule.sleepHour, schedule.sleepMinute)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{sleepHours}h sleep target</span>
        {nextAlarm && schedule.alarmEnabled && (
          <span className="text-primary">
            Next: {nextAlarm.type} in {nextAlarm.hours}h {nextAlarm.minutes}m
          </span>
        )}
      </div>
    </div>
  );
}

export function SleepScheduleEditor() {
  const [schedule, setSchedule] = useState<SleepSchedule>(() => storage.getSleepSchedule());
  const [testPlaying, setTestPlaying] = useState(false);

  const update = useCallback((partial: Partial<SleepSchedule>) => {
    const next = { ...schedule, ...partial };
    setSchedule(next);
    storage.setSleepSchedule(next);
  }, [schedule]);

  const sleepHours = Math.round(getSleepDuration(schedule) / 60 * 10) / 10;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Sun className="h-3.5 w-3.5 text-yellow-400" /> Wake-up time
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {WAKE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => update({ wakeUpHour: opt.h, wakeUpMinute: opt.m })}
              className={cn(
                "rounded-lg border py-2 text-xs font-medium transition-all",
                schedule.wakeUpHour === opt.h && schedule.wakeUpMinute === opt.m
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
        <div className="grid grid-cols-5 gap-1.5">
          {SLEEP_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => update({ sleepHour: opt.h, sleepMinute: opt.m })}
              className={cn(
                "rounded-lg border py-2 text-xs font-medium transition-all",
                schedule.sleepHour === opt.h && schedule.sleepMinute === opt.m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Sleep duration: </span>
          <span className={cn("font-semibold", sleepHours >= 7 ? "text-primary" : "text-destructive")}>
            {sleepHours} hours
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-2">Alarm days</div>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <button
              key={i}
              onClick={() => {
                const days = schedule.daysEnabled.includes(i)
                  ? schedule.daysEnabled.filter((x) => x !== i)
                  : [...schedule.daysEnabled, i];
                update({ daysEnabled: days });
              }}
              className={cn(
                "aspect-square rounded-lg border text-xs font-medium transition-all",
                schedule.daysEnabled.includes(i)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Alarm notifications</span>
        </div>
        <button
          onClick={async () => {
            const enabled = !schedule.alarmEnabled;
            update({ alarmEnabled: enabled });
            if (enabled) {
              const granted = await requestNotificationPermission();
              if (!granted) {
                update({ alarmEnabled: false });
                alert("Please allow notifications in your browser settings to use alarms.");
              } else {
                startAlarmService();
              }
            }
          }}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            schedule.alarmEnabled ? "bg-primary" : "bg-secondary"
          )}
        >
          <span
            className={cn(
              "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md",
              schedule.alarmEnabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      <button
        onClick={() => {
          if (!testPlaying) {
            setTestPlaying(true);
            playAlarmSound(2000);
            setTimeout(() => setTestPlaying(false), 2000);
          }
        }}
        disabled={testPlaying}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Volume2 className="h-3.5 w-3.5" />
        {testPlaying ? "Playing..." : "Test alarm sound"}
      </button>
    </div>
  );
}
