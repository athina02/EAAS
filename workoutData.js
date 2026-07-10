/* ==========================================================
   EAAS Workout Data
   Version 1.1
   Stores all workout goals and their metadata.
   ========================================================== */

const WORKOUT_GOALS = {

  ENDURANCE: {
    id: "endurance",
    name: "Endurance",
    icon: "🏃",
    color: "#00d9ff",
    description: "Improve stamina and aerobic endurance."
  },

  STRENGTH: {
    id: "strength",
    name: "Strength",
    icon: "💪",
    color: "#ff5252",
    description: "Increase overall strength and power."
  },

  HYBRID: {
    id: "hybrid",
    name: "Hybrid Athlete",
    icon: "⚡",
    color: "#17e08a",
    description: "Build strength, endurance and athleticism together."
  },

  COMBAT: {
    id: "combat",
    name: "Combat Sports",
    icon: "🥊",
    color: "#ff9800",
    description: "Training for boxing, MMA, kickboxing and similar sports."
  },

  FITNESS: {
    id: "fitness",
    name: "General Fitness",
    icon: "🏋️",
    color: "#9c27b0",
    description: "Improve overall health and fitness."
  },

  LEAN: {
    id: "lean",
    name: "Lean Physique",
    icon: "💎",
    color: "#00bcd4",
    description: "Build a lean, aesthetic and athletic body."
  },

  FATLOSS: {
    id: "fatloss",
    name: "Fat Loss",
    icon: "🔥",
    color: "#ff3b5c",
    description: "Reduce body fat while maintaining performance."
  },

  SPRINT: {
    id: "sprint",
    name: "Sprint Performance",
    icon: "🦵",
    color: "#ffc107",
    description: "Improve acceleration, speed and explosive power."
  },

  DISTANCE: {
    id: "distance",
    name: "Distance Running",
    icon: "🏃‍♂️",
    color: "#4caf50",
    description: "Improve long-distance running performance."
  },

  JUMP: {
    id: "jump",
    name: "Jump Performance",
    icon: "🦘",
    color: "#8bc34a",
    description: "Improve long jump, high jump and vertical jump."
  },

  CUSTOM: {
    id: "custom",
    name: "Custom Goal",
    icon: "🎯",
    color: "#607d8b",
    description: "Create your own personalized training goal."
  }

};

/* ==========================================================
   TODO:
   Future versions will include:
   - Workout templates
   - Recovery rules
   - Difficulty levels
   - Recommended weekly frequency
   - Exercise categories
   ========================================================== */