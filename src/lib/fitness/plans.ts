import type { Goal, MacroTargets } from "./types";

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; notes?: string }[];
}

export function buildWorkoutPlan(goal: Goal): WorkoutDay[] {
  if (goal === "muscle_gain") {
    return [
      { day: "Mon", focus: "Push (Chest / Shoulders / Triceps)", exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "6–8", notes: "Progressive overload" },
        { name: "Overhead Press", sets: 4, reps: "6–8" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8–10" },
        { name: "Lateral Raise", sets: 3, reps: "12–15" },
        { name: "Triceps Rope Pushdown", sets: 3, reps: "10–12" },
      ]},
      { day: "Tue", focus: "Pull (Back / Biceps)", exercises: [
        { name: "Deadlift", sets: 4, reps: "5" },
        { name: "Pull-ups / Lat Pulldown", sets: 4, reps: "6–10" },
        { name: "Barbell Row", sets: 3, reps: "8" },
        { name: "Face Pull", sets: 3, reps: "12–15" },
        { name: "Barbell Curl", sets: 3, reps: "8–10" },
      ]},
      { day: "Wed", focus: "Legs", exercises: [
        { name: "Back Squat", sets: 4, reps: "5–8" },
        { name: "Romanian Deadlift", sets: 3, reps: "8" },
        { name: "Leg Press", sets: 3, reps: "10–12" },
        { name: "Walking Lunges", sets: 3, reps: "12 each" },
        { name: "Standing Calf Raise", sets: 4, reps: "12–15" },
      ]},
      { day: "Thu", focus: "Upper Hypertrophy", exercises: [
        { name: "Incline Bench", sets: 4, reps: "8–10" },
        { name: "Seated Cable Row", sets: 4, reps: "10" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
        { name: "Hammer Curl", sets: 3, reps: "10" },
        { name: "Skull Crusher", sets: 3, reps: "10" },
      ]},
      { day: "Fri", focus: "Lower Hypertrophy", exercises: [
        { name: "Front Squat", sets: 4, reps: "8" },
        { name: "Hip Thrust", sets: 4, reps: "8–10" },
        { name: "Leg Curl", sets: 3, reps: "12" },
        { name: "Leg Extension", sets: 3, reps: "12" },
        { name: "Seated Calf Raise", sets: 4, reps: "15" },
      ]},
      { day: "Sat", focus: "Arms + Core", exercises: [
        { name: "EZ Bar Curl", sets: 4, reps: "10" },
        { name: "Close-Grip Bench", sets: 4, reps: "8" },
        { name: "Cable Curl", sets: 3, reps: "12" },
        { name: "Triceps Dip", sets: 3, reps: "AMRAP" },
        { name: "Hanging Leg Raise", sets: 4, reps: "12" },
      ]},
      { day: "Sun", focus: "Rest / Mobility", exercises: [
        { name: "Walk", sets: 1, reps: "30–45 min" },
        { name: "Full-body stretch", sets: 1, reps: "15 min" },
      ]},
    ];
  }

  if (goal === "fat_loss") {
    return [
      { day: "Mon", focus: "Push + Cardio", exercises: [
        { name: "Bench Press", sets: 4, reps: "8" },
        { name: "Overhead Press", sets: 3, reps: "8–10" },
        { name: "Cable Fly", sets: 3, reps: "12" },
        { name: "Triceps Pushdown", sets: 3, reps: "12" },
        { name: "Incline Treadmill Walk", sets: 1, reps: "20 min" },
      ]},
      { day: "Tue", focus: "Pull + Cardio", exercises: [
        { name: "Lat Pulldown", sets: 4, reps: "10" },
        { name: "Seated Row", sets: 4, reps: "10" },
        { name: "Face Pull", sets: 3, reps: "15" },
        { name: "Dumbbell Curl", sets: 3, reps: "12" },
        { name: "Cycling / Steady cardio", sets: 1, reps: "20 min" },
      ]},
      { day: "Wed", focus: "Legs", exercises: [
        { name: "Goblet Squat", sets: 4, reps: "10" },
        { name: "Romanian Deadlift", sets: 3, reps: "10" },
        { name: "Walking Lunges", sets: 3, reps: "12 each" },
        { name: "Leg Curl", sets: 3, reps: "12" },
        { name: "Calf Raise", sets: 4, reps: "15" },
      ]},
      { day: "Thu", focus: "HIIT Cardio", exercises: [
        { name: "Sprint intervals", sets: 8, reps: "30s on / 60s off" },
        { name: "Plank", sets: 3, reps: "45s" },
        { name: "Mountain Climbers", sets: 3, reps: "30s" },
      ]},
      { day: "Fri", focus: "Push + Pull (Full Upper)", exercises: [
        { name: "Incline DB Press", sets: 4, reps: "10" },
        { name: "Barbell Row", sets: 4, reps: "10" },
        { name: "Lateral Raise", sets: 3, reps: "15" },
        { name: "Pull-ups", sets: 3, reps: "AMRAP" },
      ]},
      { day: "Sat", focus: "Legs + Core + Cardio", exercises: [
        { name: "Bulgarian Split Squat", sets: 3, reps: "10 each" },
        { name: "Hip Thrust", sets: 3, reps: "12" },
        { name: "Hanging Leg Raise", sets: 4, reps: "12" },
        { name: "Steady cardio", sets: 1, reps: "30 min" },
      ]},
      { day: "Sun", focus: "Active Recovery", exercises: [
        { name: "Walk", sets: 1, reps: "45–60 min" },
        { name: "Mobility flow", sets: 1, reps: "15 min" },
      ]},
    ];
  }

  if (goal === "recomposition") {
    return [
      { day: "Mon", focus: "Push", exercises: [
        { name: "Bench Press", sets: 4, reps: "6–8" },
        { name: "Overhead Press", sets: 3, reps: "8" },
        { name: "Incline DB Press", sets: 3, reps: "10" },
        { name: "Lateral Raise", sets: 3, reps: "12–15" },
        { name: "Triceps Pushdown", sets: 3, reps: "12" },
      ]},
      { day: "Tue", focus: "Pull", exercises: [
        { name: "Pull-ups", sets: 4, reps: "6–10" },
        { name: "Barbell Row", sets: 4, reps: "8" },
        { name: "Seated Row", sets: 3, reps: "10" },
        { name: "Face Pull", sets: 3, reps: "15" },
        { name: "Barbell Curl", sets: 3, reps: "10" },
      ]},
      { day: "Wed", focus: "Legs", exercises: [
        { name: "Back Squat", sets: 4, reps: "6–8" },
        { name: "Romanian Deadlift", sets: 3, reps: "8" },
        { name: "Walking Lunges", sets: 3, reps: "12 each" },
        { name: "Leg Curl", sets: 3, reps: "12" },
        { name: "Calf Raise", sets: 4, reps: "15" },
      ]},
      { day: "Thu", focus: "Cardio (Moderate)", exercises: [
        { name: "Incline Walk", sets: 1, reps: "30 min" },
        { name: "Core Circuit", sets: 3, reps: "1 round" },
      ]},
      { day: "Fri", focus: "Full Body Strength", exercises: [
        { name: "Deadlift", sets: 4, reps: "5" },
        { name: "Incline Bench", sets: 3, reps: "8" },
        { name: "Pull-up", sets: 3, reps: "AMRAP" },
        { name: "Front Squat", sets: 3, reps: "8" },
      ]},
      { day: "Sat", focus: "Cardio + Arms", exercises: [
        { name: "Steady cardio", sets: 1, reps: "25 min" },
        { name: "EZ Curl", sets: 4, reps: "10" },
        { name: "Skull Crusher", sets: 4, reps: "10" },
        { name: "Hanging Leg Raise", sets: 3, reps: "12" },
      ]},
      { day: "Sun", focus: "Rest / Walk", exercises: [
        { name: "Walk", sets: 1, reps: "45 min" },
      ]},
    ];
  }

  // maintenance
  return [
    { day: "Mon", focus: "Upper", exercises: [
      { name: "Bench Press", sets: 4, reps: "8" },
      { name: "Row", sets: 4, reps: "8" },
      { name: "Overhead Press", sets: 3, reps: "10" },
      { name: "Pull-ups", sets: 3, reps: "AMRAP" },
    ]},
    { day: "Tue", focus: "Lower", exercises: [
      { name: "Squat", sets: 4, reps: "8" },
      { name: "RDL", sets: 3, reps: "8" },
      { name: "Lunges", sets: 3, reps: "10 each" },
    ]},
    { day: "Wed", focus: "Cardio", exercises: [
      { name: "Run / Bike", sets: 1, reps: "30 min" },
    ]},
    { day: "Thu", focus: "Upper", exercises: [
      { name: "Incline DB Press", sets: 4, reps: "10" },
      { name: "Lat Pulldown", sets: 4, reps: "10" },
      { name: "Lateral Raise", sets: 3, reps: "12" },
      { name: "Curl + Pushdown", sets: 3, reps: "12" },
    ]},
    { day: "Fri", focus: "Lower + Core", exercises: [
      { name: "Deadlift", sets: 4, reps: "5" },
      { name: "Leg Press", sets: 3, reps: "12" },
      { name: "Plank", sets: 3, reps: "60s" },
    ]},
    { day: "Sat", focus: "Active", exercises: [
      { name: "Sport / Hike", sets: 1, reps: "60 min" },
    ]},
    { day: "Sun", focus: "Rest", exercises: [
      { name: "Stretch", sets: 1, reps: "15 min" },
    ]},
  ];
}

export interface MealItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
}
export interface Meal {
  title: string;
  time: string;
  items: MealItem[];
}

/** Hostel-friendly meal plan, scales to calorie target. */
export function buildMealPlan(t: MacroTargets): Meal[] {
  const cal = t.calories;
  // Scaling factor vs a 2200 kcal baseline
  const s = cal / 2200;
  const r = (n: number) => Math.round(n * s);

  return [
    {
      title: "Breakfast",
      time: "8:00 AM",
      items: [
        { name: "Protein Oats", amount: `${r(60)}g oats + ${r(250)}ml milk`, calories: r(380), protein: r(18) },
        { name: "Whole Eggs", amount: `${Math.max(2, Math.round(2 * s))} eggs, boiled`, calories: r(160), protein: r(12) },
      ],
    },
    {
      title: "Mid-Morning",
      time: "11:00 AM",
      items: [
        { name: "Curd Bowl", amount: `${r(200)}g curd + 1 tsp honey`, calories: r(180), protein: r(10) },
      ],
    },
    {
      title: "Lunch",
      time: "1:30 PM",
      items: [
        { name: "Rice + Roti", amount: `${r(120)}g rice + 2 roti`, calories: r(520), protein: r(14) },
        { name: "Mixed Veg", amount: "Broccoli, beans, carrot — 1 bowl", calories: r(120), protein: r(6) },
        { name: "Egg Whites", amount: `${Math.max(3, Math.round(4 * s))} egg whites`, calories: r(70), protein: r(15) },
      ],
    },
    {
      title: "Pre-Workout",
      time: "5:00 PM",
      items: [
        { name: "Banana", amount: "1 medium", calories: 105, protein: 1 },
        { name: "Black Coffee", amount: "1 cup", calories: 5, protein: 0 },
      ],
    },
    {
      title: "Post-Workout",
      time: "7:00 PM",
      items: [
        { name: "Whey Protein Shake", amount: `1 scoop + ${r(250)}ml milk`, calories: r(260), protein: r(32) },
      ],
    },
    {
      title: "Dinner",
      time: "9:00 PM",
      items: [
        { name: "Sweet Potato", amount: `${r(200)}g baked`, calories: r(180), protein: r(4) },
        { name: "Salad Bowl", amount: "Lettuce, beetroot, carrot", calories: r(80), protein: r(3) },
        { name: "Eggs / Curd", amount: `2 eggs or ${r(200)}g curd`, calories: r(160), protein: r(14) },
      ],
    },
  ];
}