/* ==========================================================
   EAAS Workout Engine
   Version 1.1
   Generates today's workout based on Recovery & Goal.
   ========================================================== */

/**
 * Workout intensity levels
 */
const WORKOUT_LEVELS = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  REST: "Rest"
};

/**
 * Decide workout intensity from recovery score.
 */
function getWorkoutLevel(recovery) {

  if (recovery >= 80) return WORKOUT_LEVELS.HIGH;

  if (recovery >= 60) return WORKOUT_LEVELS.MEDIUM;

  if (recovery >= 40) return WORKOUT_LEVELS.LOW;

  return WORKOUT_LEVELS.REST;

}

/**
 * Main Workout Generator
 */
function generateWorkout(athlete) {

  const level = getWorkoutLevel(athlete.recovery);

  return {

    title: athlete.goal || "General Fitness",

    level: level,

    exercises: []

  };

}