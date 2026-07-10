/* ==========================================================
   EAAS / ATHINA DASHBOARD — script.js
   Recovery Engine v0.4 — Code Quality & Architecture Pass
   Single source of truth: athleteData
   ========================================================== */

/* ==========================================================
   SECTION 1: STATE
   ========================================================== */

/**
 * The single source of truth for all athlete-related data.
 * No other object should hold a duplicate copy of this state.
 * @type {Object}
 */
const athleteData = {
  name: "",
  age: null,
  height: null,
  weight: null,
  sport: "",
  goal: "",
  sleep: null,      // hours (e.g. 7.5)
  energy: null,      // "High" | "Medium" | "Low"
  soreness: null,    // "None" | "Light" | "Medium" | "High"
  recovery: null,    // 0-100, derived by calculateRecovery()
  mission: ""
};

/**
 * A blank template used by resetAthleteData() to safely restore
 * athleteData to its default empty state without breaking object
 * references held elsewhere in the app.
 * @type {Object}
 */
const EMPTY_ATHLETE_STATE = {
  name: "",
  age: null,
  height: null,
  weight: null,
  sport: "",
  goal: "",
  sleep: null,
  energy: null,
  soreness: null,
  recovery: null,
  mission: ""
};

// TODO: Quick stats (workouts/streak/records) will come from
// athleteData or a linked stats object once tracking is built.
const quickStatsData = {
  totalWorkouts: null,
  currentStreak: null,
  personalRecords: null
};

/* ==========================================================
   SECTION 2: RECOVERY ENGINE
   Pure scoring functions — no DOM access, easy to unit test
   and easy to extend with new inputs (e.g. HRV from a wearable).
   ========================================================== */

/** Point tables used by the recovery engine. Centralized here so
 *  future tuning (or AI-driven weighting) only touches one place. */
const RECOVERY_WEIGHTS = {
  sleep: [
    { min: 8, points: 40 },
    { min: 7, points: 35 },
    { min: 6, points: 28 },
    { min: 5, points: 20 },
    { min: 0, points: 10 }
  ],
  energy: { High: 30, Medium: 20, Low: 10 },
  soreness: { None: 30, Light: 22, Medium: 14, High: 6 }
};

/** Thresholds that map a recovery score to a status label/color. */
const RECOVERY_STATUS_LEVELS = [
  { min: 80, label: "READY", color: "#00d9ff" },
  { min: 60, label: "GOOD", color: "#17e08a" },
  { min: 40, label: "CAUTION", color: "#f5a623" },
  { min: 0, label: "REST", color: "#ff3b5c" }
];

/**
 * Converts hours of sleep into a recovery score (0-40).
 * @param {number|null} sleepHours
 * @returns {number}
 */
function getSleepScore(sleepHours) {
  if (sleepHours === null || sleepHours === undefined) return 0;

  const tier = RECOVERY_WEIGHTS.sleep.find(t => sleepHours >= t.min);
  return tier ? tier.points : 0;
}

/**
 * Converts an energy level into a recovery score (0-30).
 * @param {string|null} energyLevel - "High" | "Medium" | "Low"
 * @returns {number}
 */
function getEnergyScore(energyLevel) {
  return RECOVERY_WEIGHTS.energy[energyLevel] ?? 0;
}

/**
 * Converts a soreness level into a recovery score (0-30).
 * @param {string|null} sorenessLevel - "None" | "Light" | "Medium" | "High"
 * @returns {number}
 */
function getSorenessScore(sorenessLevel) {
  return RECOVERY_WEIGHTS.soreness[sorenessLevel] ?? 0;
}

/**
 * Clamps a number between a min and max value.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Checks whether enough raw inputs exist to produce a meaningful
 * recovery score. Used to avoid showing a fake "0%" when data is
 * simply missing (as opposed to genuinely low).
 * @returns {boolean}
 */
function hasRecoveryData() {
  return (
    athleteData.sleep !== null &&
    athleteData.energy !== null &&
    athleteData.soreness !== null
  );
}

/**
 * Calculates today's recovery score from sleep, energy and soreness,
 * writes it into athleteData.recovery, and returns it.
 * Returns null when insufficient data is available.
 * @returns {number|null}
 */
function calculateRecovery() {
  if (!hasRecoveryData()) {
    athleteData.recovery = null;
    return null;
  }

  const sleepScore = getSleepScore(athleteData.sleep);
  const energyScore = getEnergyScore(athleteData.energy);
  const sorenessScore = getSorenessScore(athleteData.soreness);

  const total = clamp(sleepScore + energyScore + sorenessScore, 0, 100);

  athleteData.recovery = total;
  return total;
}

/**
 * Maps a recovery score to its status tier (label + color).
 * Falls back to a neutral "--" tier when recovery is null.
 * @param {number|null} recovery
 * @returns {{min: number, label: string, color: string}}
 */
function getRecoveryStatusTier(recovery) {
  if (recovery === null) {
    return { min: 0, label: "--", color: "#7d8b9a" };
  }
  return RECOVERY_STATUS_LEVELS.find(tier => recovery >= tier.min);
}

/**
 * Convenience wrapper — returns just the status label
 * (READY / GOOD / CAUTION / REST / --).
 * @param {number|null} recovery
 * @returns {string}
 */
function getRecoveryStatusLabel(recovery) {
  return getRecoveryStatusTier(recovery).label;
}

/* ==========================================================
   SECTION 3: MISSION ENGINE
   Kept separate from the recovery engine so mission logic can
   later be swapped for an AI-generated plan without touching
   recovery calculations.
   ========================================================== */

/** Recovery-score-to-mission map. Extend this table (not the
 *  function) when new mission types are introduced. */
const MISSION_RULES = [
  { min: 80, mission: "Hard Training" },
  { min: 60, mission: "Normal Training" },
  { min: 40, mission: "Light Training" },
  { min: 0, mission: "Recovery Day" }
];

/**
 * Derives today's training mission from athleteData.recovery
 * and writes it into athleteData.mission.
 * @returns {string}
 */
function updateMission() {
  const recovery = athleteData.recovery;

  if (recovery === null) {
    athleteData.mission = "";
    return athleteData.mission;
  }

  const rule = MISSION_RULES.find(r => recovery >= r.min);
  athleteData.mission = rule ? rule.mission : "";

  // TODO: AI — once ATHINA's AI Coach (Gemini API) is connected,
  // replace this rule table with a call that also factors in
  // sport, goal, and training history, not just recovery score.
  return athleteData.mission;
}

/* ==========================================================
   SECTION 4: DOM HELPERS
   ========================================================== */

/**
 * Shorthand for document.getElementById, kept in one place so
 * DOM access patterns can be swapped later (e.g. for a framework)
 * without touching every render function.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getEl(id) {
  return document.getElementById(id);
}

/**
 * Sets text content on an element, falling back to a placeholder
 * when the value is null/undefined so render functions never
 * hardcode "--" individually.
 * @param {string} id
 * @param {string|number|null} value
 * @param {string} [placeholder="--"]
 */
function setText(id, value, placeholder = "--") {
  const el = getEl(id);
  if (!el) return;
  el.textContent = (value === null || value === undefined || value === "")
    ? placeholder
    : value;
}

/* ==========================================================
   SECTION 5: RENDER FUNCTIONS
   Each function reads ONLY from athleteData / quickStatsData —
   never hardcodes a display value.
   ========================================================== */

/**
 * Updates the greeting text based on the current time of day.
 * TODO: Database — replace "Welcome Back" with
 * `Welcome Back, ${athleteData.name}` once profile data exists.
 */
function renderGreeting() {
  const hour = new Date().getHours();
  let timeText = "Good Night";

  if (hour >= 5 && hour < 12) timeText = "Good Morning";
  else if (hour >= 12 && hour < 17) timeText = "Good Afternoon";
  else if (hour >= 17 && hour < 21) timeText = "Good Evening";

  setText("greetingTime", timeText);
  setText("greetingSub", athleteData.name ? `Welcome Back, ${athleteData.name}` : "Welcome Back");
}

/**
 * Renders the live date & time string. Called on init and on
 * a repeating interval.
 */
function renderDateTime() {
  const now = new Date();

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  setText("datetime", `${dateStr} • ${hours}:${minutes} ${ampm}`);
}

/**
 * Draws the recovery ring (SVG stroke-dashoffset) based on a
 * 0-100 percentage. Ring color is resolved via CSS custom
 * property so it can be re-themed per status without changing
 * markup — currently always neon blue, per current UI design.
 * @param {number|null} percent
 */
function renderRecoveryRing(percent) {
  const ring = getEl("ringFill");
  if (!ring) return;

  const circumference = 2 * Math.PI * 52; // r = 52
  const safePercent = percent === null ? 0 : percent;
  const offset = circumference - (safePercent / 100) * circumference;

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;

  // Ring color is read from CSS var --ring-color, defaulted in style.css
  // to the current neon blue. Setting it here (rather than hardcoding
  // a color in CSS) means future status-based coloring only needs to
  // set this one custom property — no structural UI change required.
  const statusColor = getRecoveryStatusTier(percent).color;
  ring.style.setProperty("--ring-color", statusColor);
}

/**
 * Renders the Recovery card: ring, percentage, status label,
 * and the sleep/energy/weight stat row.
 */
function renderRecoveryCard() {
  const { recovery, sleep, energy, weight } = athleteData;

  renderRecoveryRing(recovery);
  setText("recoveryPercent", recovery !== null ? `${recovery}%` : null);
  setText("ringLabel", getRecoveryStatusLabel(recovery));

  setText("sleepValue", sleep !== null ? `${sleep}h` : null);
  setText("energyValue", energy);
  setText("weightValue", weight !== null ? `${weight}kg` : null);

  // TODO: Wearables — sleep/energy/soreness will eventually be
  // filled automatically via smartwatch/fitness band sync instead
  // of manual entry through setAthleteData().
}

/**
 * Renders the Today's Mission card. The mission TAG now mirrors
 * the recovery status (READY/GOOD/CAUTION/REST) instead of a
 * generic "Active" label, giving the athlete instant context.
 */
function renderMissionCard() {
  const hasMission = athleteData.mission && athleteData.mission.trim() !== "";

  setText("missionText", hasMission ? athleteData.mission : "No mission set yet.");
  setText("missionTag", getRecoveryStatusLabel(athleteData.recovery));
}

/**
 * Renders the Quick Stats row (workouts, streak, records).
 * TODO: Database — pull real values from workout history once
 * the Workout Tracker module exists.
 */
function renderQuickStats() {
  const { totalWorkouts, currentStreak, personalRecords } = quickStatsData;

  setText("totalWorkouts", totalWorkouts);
  setText("currentStreak", currentStreak);
  setText("personalRecords", personalRecords);
}

/**
 * The ONLY function responsible for refreshing the visible UI.
 * Recalculates derived state (recovery, mission) then re-renders
 * every section from athleteData / quickStatsData.
 */
function updateDashboard() {
  calculateRecovery();
  updateMission();

  renderGreeting();
  renderRecoveryCard();
  renderMissionCard();
  renderQuickStats();
}

/* ==========================================================
   SECTION 6: DATA ENTRY POINTS
   These are the ONLY functions allowed to mutate athleteData.
   Every future data source (form, Firebase, wearable, AI) must
   go through setAthleteData() so the UI always stays in sync.
   ========================================================== */

/**
 * Merges new fields into athleteData and triggers a full
 * dashboard refresh. This is the single controlled entry point
 * for changing athlete state.
 * @param {Partial<typeof athleteData>} newData
 */
function setAthleteData(newData) {
  Object.assign(athleteData, newData);
  updateDashboard();

  // TODO: Firebase — mirror this update to Firestore/Realtime DB
  // so recovery history is saved and available across devices.
}

/**
 * Safely resets athleteData back to its empty default state
 * (e.g. for logout or switching profiles) and refreshes the UI.
 */
function resetAthleteData() {
  Object.assign(athleteData, EMPTY_ATHLETE_STATE);
  updateDashboard();
}

/* ==========================================================
   SECTION 7: NAVIGATION
   Empty handlers reserved for future pages.
   ========================================================== */

function goToHome() {
  // TODO: Render Home dashboard (current default view)
  console.log("Navigating to: Home");
}

function goToWorkout() {
  // TODO: Build Workout Tracker page
  console.log("Navigating to: Workout");
}

function goToProgress() {
  // TODO: Build Progress Analytics page (charts, PRs, history)
  console.log("Navigating to: Progress");
}

function goToAthina() {
  // TODO: Build ATHINA Chat / Voice Assistant page.
  // TODO: Voice Assistant — connect Speech Recognition + Text-to-Speech here.
  // TODO: AI — Gemini API responses will be generated here.
  console.log("Navigating to: ATHINA");
}

function goToSettings() {
  // TODO: Build Settings page (profile, preferences, account)
  console.log("Navigating to: Settings");
}

/** Maps each bottom-nav data-nav value to its handler. Adding a
 *  new tab later only requires adding one entry here. */
const NAV_HANDLERS = {
  home: goToHome,
  workout: goToWorkout,
  progress: goToProgress,
  athina: goToAthina,
  settings: goToSettings
};

/**
 * Wires up click handling for the bottom navigation bar:
 * toggles the active tab and delegates to the matching handler.
 */
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const section = item.getAttribute("data-nav");
      NAV_HANDLERS[section]?.();
    });
  });
}

/**
 * Wires up the Start Workout button.
 * TODO: Start actual workout session flow once Workout module exists.
 */
function setupStartButton() {
  getEl("startWorkoutBtn")?.addEventListener("click", () => {
    console.log("Workout session starting...");
  });
}

/* ==========================================================
   SECTION 8: INIT
   ========================================================== */

/**
 * Temporary demo data used only until real input (manual form,
 * wearable sync, or Firebase) is wired in. Passed through
 * setAthleteData() so it follows the exact same code path as
 * real future data — nothing here bypasses the normal flow.
 * TODO: Remove once a real data source is connected.
 */
const demoAthleteData = {
  sleep: 7.5,
  energy: "High",
  soreness: "Light",
  weight: 68
};

/**
 * App entry point — sets up static UI, loads initial data,
 * and starts recurring updates.
 */
function init() {
  renderDateTime();
  setupNavigation();
  setupStartButton();

  // TODO: Wearables/Firebase — replace this demo call with a real
  // async data load once available.
  setAthleteData(demoAthleteData);

  // Keep the clock live without needing a full dashboard refresh.
  setInterval(renderDateTime, 30000);
}

document.addEventListener("DOMContentLoaded", init);