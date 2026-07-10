/**
 * Main Workout Generator
 */
function generateWorkout(athlete) {

  const level = getWorkoutLevel(athlete.recovery);

  const workout = {
    title: athlete.goal || "General Fitness",
    level: level,
    exercises: []
  };

  // ---------- Warm-up ----------
  workout.exercises.push(...WORKOUT_TEMPLATES.WARMUP);

  // ---------- Goal Based ----------
  switch (athlete.goal) {

    case "Strength":
      workout.exercises.push(...WORKOUT_TEMPLATES.STRENGTH);
      break;

    case "Endurance":
      workout.exercises.push(...WORKOUT_TEMPLATES.ENDURANCE);
      break;

    case "Hybrid Athlete":
      workout.exercises.push(
        ...WORKOUT_TEMPLATES.STRENGTH,
        ...WORKOUT_TEMPLATES.ENDURANCE
      );
      break;

    case "Sprint Performance":
      workout.exercises.push(...WORKOUT_TEMPLATES.SPRINT);
      break;

    case "Jump Performance":
      workout.exercises.push(...WORKOUT_TEMPLATES.JUMP);
      break;

    case "Combat Sports":
      workout.exercises.push(...WORKOUT_TEMPLATES.COMBAT);
      break;

    default:
      workout.exercises.push(...WORKOUT_TEMPLATES.STRENGTH);
  }

  // ---------- Core ----------
  workout.exercises.push(...WORKOUT_TEMPLATES.CORE);

  // ---------- Stretch ----------
  workout.exercises.push(...WORKOUT_TEMPLATES.STRETCHING);

  // ---------- Cooldown ----------
  workout.exercises.push(...WORKOUT_TEMPLATES.COOLDOWN);

  return workout;

}