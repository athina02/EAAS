/* ==========================================================
   EAAS Workout Templates
   Version 2.5
   Reusable Exercise Database
   ========================================================== */

const WORKOUT_TEMPLATES = {

  WARMUP: [
    {
      id: "jumping_jacks",
      name: "Jumping Jacks",
      category: "Warm-up",
      type: "time",
      value: 3,
      unit: "min",
      sets: 1,
      difficulty: "Easy",
      equipment: "None",
      goals: ["All"],
      recovery: ["High","Medium","Low"],
      indoor: true
    },
    {
      id: "high_knees",
      name: "High Knees",
      category: "Warm-up",
      type: "time",
      value: 2,
      unit: "min",
      sets: 1,
      difficulty: "Easy",
      equipment: "None",
      goals: ["All"],
      recovery: ["High","Medium","Low"],
      indoor: true
    }
  ],

  STRENGTH: [
    {
      id: "pushups",
      name: "Push-ups",
      category: "Strength",
      type: "reps",
      value: 15,
      unit: "reps",
      sets: 4,
      difficulty: "Beginner",
      equipment: "None",
      muscles: ["Chest","Shoulders","Triceps"],
      goals: ["Strength","Hybrid Athlete","Lean Physique"],
      recovery: ["High","Medium"],
      indoor: true
    },
    {
      id: "pullups",
      name: "Pull-ups",
      category: "Strength",
      type: "reps",
      value: 8,
      unit: "reps",
      sets: 4,
      difficulty: "Intermediate",
      equipment: "Pull-up Bar",
      muscles: ["Back","Biceps"],
      goals: ["Strength","Hybrid Athlete"],
      recovery: ["High"],
      indoor: true
    },
    {
      id: "bodyweight_squats",
      name: "Bodyweight Squats",
      category: "Strength",
      type: "reps",
      value: 20,
      unit: "reps",
      sets: 4,
      difficulty: "Beginner",
      equipment: "None",
      muscles: ["Legs","Glutes"],
      goals: ["Strength","Hybrid Athlete","General Fitness"],
      recovery: ["High","Medium"],
      indoor: true
    }
  ],

  ENDURANCE: [
    {
      id: "easy_run",
      name: "Easy Run",
      category: "Endurance",
      type: "distance",
      value: 5,
      unit: "km",
      sets: 1,
      difficulty: "Easy",
      equipment: "Running Shoes",
      goals: ["Endurance","Distance Running","Fat Loss"],
      recovery: ["High","Medium"],
      indoor: false
    },
    {
      id: "tempo_run",
      name: "Tempo Run",
      category: "Endurance",
      type: "distance",
      value: 3,
      unit: "km",
      sets: 1,
      difficulty: "Medium",
      equipment: "Running Shoes",
      goals: ["Endurance","Hybrid Athlete"],
      recovery: ["High"],
      indoor: false
    }
  ],

  SPRINT: [
    {
      id: "60m_sprint",
      name: "60m Sprint",
      category: "Sprint",
      type: "reps",
      value: 8,
      unit: "runs",
      sets: 1,
      difficulty: "Hard",
      equipment: "Running Shoes",
      goals: ["Sprint Performance","Hybrid Athlete"],
      recovery: ["High"],
      indoor: false
    },
    {
      id: "100m_sprint",
      name: "100m Sprint",
      category: "Sprint",
      type: "reps",
      value: 6,
      unit: "runs",
      sets: 1,
      difficulty: "Hard",
      equipment: "Running Shoes",
      goals: ["Sprint Performance"],
      recovery: ["High"],
      indoor: false
    }
  ],

  JUMP: [
    {
      id: "long_jump_drill",
      name: "Long Jump Drill",
      category: "Jump",
      type: "reps",
      value: 8,
      unit: "jumps",
      sets: 3,
      difficulty: "Medium",
      equipment: "None",
      goals: ["Jump Performance"],
      recovery: ["High","Medium"],
      indoor: false
    },
    {
      id: "high_jump_drill",
      name: "High Jump Drill",
      category: "Jump",
      type: "reps",
      value: 8,
      unit: "jumps",
      sets: 3,
      difficulty: "Medium",
      equipment: "None",
      goals: ["Jump Performance"],
      recovery: ["High","Medium"],
      indoor: false
    }
  ],

  CORE: [
    {
      id: "plank",
      name: "Plank",
      category: "Core",
      type: "time",
      value: 60,
      unit: "sec",
      sets: 3,
      difficulty: "Easy",
      equipment: "None",
      goals: ["All"],
      recovery: ["High","Medium","Low"],
      indoor: true
    }
  ],

  STRETCHING: [
    {
      id: "full_body_stretch",
      name: "Full Body Stretch",
      category: "Stretching",
      type: "time",
      value: 10,
      unit: "min",
      sets: 1,
      difficulty: "Easy",
      equipment: "None",
      goals: ["All"],
      recovery: ["High","Medium","Low"],
      indoor: true
    }
  ],

  COOLDOWN: [
    {
      id: "walking",
      name: "Slow Walk",
      category: "Cooldown",
      type: "time",
      value: 5,
      unit: "min",
      sets: 1,
      difficulty: "Easy",
      equipment: "None",
      goals: ["All"],
      recovery: ["High","Medium","Low"],
      indoor: false
    }
  ]

};