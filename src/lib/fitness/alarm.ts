import { storage } from "./storage";
import type { SleepSchedule } from "./types";

let alarmIntervalId: ReturnType<typeof setInterval> | null = null;
let lastTriggered: { type: string; time: string } | null = null;

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Show a browser notification.
 */
function showNotification(title: string, body: string, tag: string) {
  if (Notification.permission !== "granted") return;

  // Use service worker notification if available (works better on mobile)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag,
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
      });
    });
  } else {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      tag,
    });
  }
}

/**
 * Play an alarm sound using Web Audio API.
 */
export function playAlarmSound(durationMs = 3000) {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);

    // Pulse pattern
    const pulseCount = Math.floor(durationMs / 500);
    for (let i = 0; i < pulseCount; i++) {
      const start = ctx.currentTime + i * 0.5;
      gainNode.gain.setValueAtTime(0.3, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationMs / 1000);

    setTimeout(() => ctx.close(), durationMs + 500);
  } catch {
    // Audio not available
  }
}

/**
 * Check if it's time to fire an alarm.
 */
function checkAlarm() {
  const schedule = storage.getSleepSchedule();
  if (!schedule.alarmEnabled) return;

  const now = new Date();
  const day = now.getDay();
  if (!schedule.daysEnabled.includes(day)) return;

  const h = now.getHours();
  const m = now.getMinutes();
  const timeKey = `${h}:${m}`;

  // Wake-up alarm
  if (h === schedule.wakeUpHour && m === schedule.wakeUpMinute) {
    if (!lastTriggered || lastTriggered.type !== "wake" || lastTriggered.time !== timeKey) {
      lastTriggered = { type: "wake", time: timeKey };
      showNotification(
        "⏰ Wake Up! It's Time!",
        "Rise and shine! Time to crush your fitness goals today.",
        "wake-alarm",
      );
      playAlarmSound(4000);
    }
  }

  // Sleep alarm
  if (h === schedule.sleepHour && m === schedule.sleepMinute) {
    if (!lastTriggered || lastTriggered.type !== "sleep" || lastTriggered.time !== timeKey) {
      lastTriggered = { type: "sleep", time: timeKey };
      showNotification(
        "🌙 Time to Sleep!",
        "Recovery is crucial. Get your rest for tomorrow's gains.",
        "sleep-alarm",
      );
      playAlarmSound(3000);
    }
  }
}

/**
 * Start the alarm checker (runs every 30 seconds).
 */
export function startAlarmService() {
  if (alarmIntervalId) return;
  checkAlarm(); // check immediately
  alarmIntervalId = setInterval(checkAlarm, 30_000);
}

/**
 * Stop the alarm service.
 */
export function stopAlarmService() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Format hour:minute for display (12h format).
 */
export function formatTime(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Get time until next alarm.
 */
export function getTimeUntilNextAlarm(schedule: SleepSchedule): { type: string; hours: number; minutes: number } | null {
  if (!schedule.alarmEnabled) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const wakeMinutes = schedule.wakeUpHour * 60 + schedule.wakeUpMinute;
  const sleepMinutes = schedule.sleepHour * 60 + schedule.sleepMinute;

  const alarms = [
    { type: "Wake up", minutes: wakeMinutes },
    { type: "Sleep", minutes: sleepMinutes },
  ];

  let closest: { type: string; diff: number } | null = null;

  for (const alarm of alarms) {
    let diff = alarm.minutes - currentMinutes;
    if (diff <= 0) diff += 24 * 60; // wrap to next day

    if (!closest || diff < closest.diff) {
      closest = { type: alarm.type, diff };
    }
  }

  if (!closest) return null;

  return {
    type: closest.type,
    hours: Math.floor(closest.diff / 60),
    minutes: closest.diff % 60,
  };
}
