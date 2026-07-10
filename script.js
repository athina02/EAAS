/* ==========================================================
   EAAS / ATHINA DASHBOARD — script.js
   Recovery Engine v0.4 (unchanged) + Daily Check-in v1.0
   Single source of truth: athleteData
   ========================================================== */

/* ==========================================================
   SECTION 1: STATE
   ========================================================== */

/** @type {Object} The single source of truth for athlete data. */
const athleteData = {
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

/** @type {Object} Blank template used by resetAthleteData(). */
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

// TODO: Cloud Sync — quick stats will come from workout history
// once the Workout Tracker module + database exist.
const quickStatsData = {
  totalWorkouts: null,
  currentStreak: null,
  personalRecords: null
};

/** localStorage key used to persist athleteData between sessions. */
const STORAGE_KEY = "eaas_athlete_data";

/* ==========================================================
   SECTION 2: RECOVERY ENGINE (unchanged from v0.4)
   ========================================================== */

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

const RECOVERY_STATUS_LEVELS = [
  { min: 80, label: "READY", color: "#00d9ff" },
  { min: 60, label: "GOOD", color: "#17e08a" },
  { min: 40, label: "CAUTION", color: "#f5a623" },
  { min: 0, label: "REST", color: "#ff3b5c" }
];

/** @param {number|null} sleepHours @returns {number} */
function getSleepScore(sleepHours) {
  if (sleepHours === null || sleepHours === undefined) return 0;
  const tier = RECOVERY_WEIGHTS.sleep.find(t => sleepHours >= t.min);
  return tier ? tier.points : 0;
}

/** @param {string|null} energyLevel @returns {number} */
function getEnergyScore(energyLevel) {
  return RECOVERY_WEIGHTS.energy[energyLevel] ?? 0;
}

/** @param {string|null} sorenessLevel @returns {number} */
function getSorenessScore(sorenessLevel) {
  return RECOVERY_WEIGHTS.soreness[sorenessLevel] ?? 0;
}

/** @param {number} value @param {number} min @param {number} max @returns {number} */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** @returns {boolean} True only if sleep, energy and soreness are all set. */
function hasRecoveryData() {
  return (
    athleteData.sleep !== null &&
    athleteData.energy !== null &&
    athleteData.soreness !== null
  );
}

/** @returns {number|null} Calculated recovery score, also written to athleteData.recovery. */
function calculateRecovery() {
  if (!hasRecoveryData()) {
    athleteData.recovery = null;
    return null;
  }

  const sleepScore = getSleepScore(athleteData.sleep);
  const energyScore = getEnergyScore(athleteData.energy);
  const sorenessScore = getSorenessScore(athleteData.soreness);

  athleteData.recovery = clamp(sleepScore + energyScore + sorenessScore, 0, 100);
  return athleteData.recovery;
}

/** @param {number|null} recovery @returns {{min:number,label:string,color:string}} */
function getRecoveryStatusTier(recovery) {
  if (recovery === null) return { min: 0, label: "--", color: "#7d8b9a" };
  return RECOVERY_STATUS_LEVELS.find(tier => recovery >= tier.min);
}

/** @param {number|null} recovery @returns {string} */
function getRecoveryStatusLabel(recovery) {
  return getRecoveryStatusTier(recovery).label;
}

/* ==========================================================
   SECTION 3: MISSION ENGINE (unchanged from v0.4)
   ========================================================== */

const MISSION_RULES = [
  { min: 80, mission: "Hard Training" },
  { min: 60, mission: "Normal Training" },
  { min: 40, mission: "Light Training" },
  { min: 0, mission: "Recovery Day" }
];

/** @returns {string} The derived mission, also written to athleteData.mission. */
function updateMission() {
  const recovery = athleteData.recovery;

  if (recovery === null) {
    athleteData.mission = "";
    return athleteData.mission;
  }

  const rule = MISSION_RULES.find(r => recovery >= r.min);
  athleteData.mission = rule ? rule.mission : "";

  // TODO: Gemini AI — replace this rule table with an AI-generated
  // mission based on sport, goal and training history.
  return athleteData.mission;
}

/* ==========================================================
   SECTION 4: DOM HELPERS
   ========================================================== */

/** @param {string} id @returns {HTMLElement|null} */
function getEl(id) {
  return document.getElementById(id);
}

/**
 * Sets text content on an element, falling back to a placeholder
 * when the value is null/undefined/empty.
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
   ========================================================== */

/** Updates the greeting text based on the current time of day. */
function renderGreeting() {
  const hour = new Date().getHours();
  let timeText = "Good Night";

  if (hour >= 5 && hour < 12) timeText = "Good Morning";
  else if (hour >= 12 && hour < 17) timeText = "Good Afternoon";
  else if (hour >= 17 && hour < 21) timeText = "Good Evening";

  setText("greetingTime", timeText);
  setText("greetingSub", athleteData.name ? `Welcome Back, ${athleteData.name}` : "Welcome Back");
}

/** Renders the live date & time string. */
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
 * Draws the recovery ring and updates its color via the
 * --ring-color CSS custom property based on recovery status.
 * @param {number|null} percent
 */
function renderRecoveryRing(percent) {
  const ring = getEl("ringFill");
  if (!ring) return;

  const circumference = 2 * Math.PI * 52;
  const safePercent = percent === null ? 0 : percent;
  const offset = circumference - (safePercent / 100) * circumference;

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;
  ring.style.setProperty("--ring-color", getRecoveryStatusTier(percent).color);
}

/** Renders the Recovery card: ring, percentage, status label, stat row. */
function renderRecoveryCard() {
  const { recovery, sleep, energy, weight } = athleteData;

  renderRecoveryRing(recovery);
  setText("recoveryPercent", recovery !== null ? `${recovery}%` : null);
  setText("ringLabel", getRecoveryStatusLabel(recovery));

  setText("sleepValue", sleep !== null ? `${sleep}h` : null);
  setText("energyValue", energy);
  setText("weightValue", weight !== null ? `${weight}kg` : null);

  // TODO: Wearables — sleep/energy/soreness will eventually sync
  // automatically from a smartwatch/fitness band.
}

/** Renders the Today's Mission card, tag mirrors recovery status. */
function renderMissionCard() {
  const hasMission = athleteData.mission && athleteData.mission.trim() !== "";

  setText("missionText", hasMission ? athleteData.mission : "No mission set yet.");
  setText("missionTag", getRecoveryStatusLabel(athleteData.recovery));
}

/** Renders the Quick Stats row. */
function renderQuickStats() {
  const { totalWorkouts, currentStreak, personalRecords } = quickStatsData;
  setText("totalWorkouts", totalWorkouts);
  setText("currentStreak", currentStreak);
  setText("personalRecords", personalRecords);
}

/**
 * The ONLY function responsible for refreshing the visible UI.
 * Recalculates derived state then re-renders every section.
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
   SECTION 6: DATA ENTRY POINTS + PERSISTENCE
   ========================================================== */

/**
 * Merges new fields into athleteData, persists to localStorage,
 * and triggers a full dashboard refresh. The ONLY controlled
 * entry point for changing athlete state.
 * @param {Partial<typeof athleteData>} newData
 */
function setAthleteData(newData) {
  Object.assign(athleteData, newData);
  saveAthleteDataToStorage();
  updateDashboard();

  // TODO: Firebase — mirror this update to Firestore/Realtime DB
  // once cloud sync is added, so history is available cross-device.
}

/** Resets athleteData to its empty default state and refreshes the UI. */
function resetAthleteData() {
  Object.assign(athleteData, EMPTY_ATHLETE_STATE);
  saveAthleteDataToStorage();
  updateDashboard();
}

/**
 * Saves the current athleteData snapshot to Local Storage.
 * TODO: Firebase/Cloud Sync — once available, this becomes a
 * secondary/offline cache instead of the primary store.
 */
function saveAthleteDataToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athleteData));
  } catch (err) {
    console.warn("Could not save athleteData to Local Storage:", err);
  }
}

/**
 * Loads athleteData from Local Storage if present.
 * @returns {Object|null} Parsed data, or null if none/invalid.
 */
function loadAthleteDataFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Could not read athleteData from Local Storage:", err);
    return null;
  }
}

/* ==========================================================
   SECTION 7: DAILY CHECK-IN FEATURE
   ========================================================== */

/** Validation bounds for numeric check-in fields. */
const CHECKIN_LIMITS = {
  weight: { min: 20, max: 250 },
  sleep: { min: 0, max: 24 }
};

/**
 * Toggles the collapsible Check-in card open/closed with a
 * smooth max-height animation.
 */
function toggleCheckinCard() {
  const card = getEl("checkinToggle").closest(".checkin-card");
  const isOpen = card.classList.toggle("open");
  getEl("checkinToggle").setAttribute("aria-expanded", String(isOpen));
}

/** Closes the collapsible Check-in card (used after a successful save). */
function collapseCheckinCard() {
  const card = getEl("checkinToggle").closest(".checkin-card");
  card.classList.remove("open");
  getEl("checkinToggle").setAttribute("aria-expanded", "false");
}

/**
 * Clears all inline validation messages/error states on the
 * check-in form.
 */
function clearCheckinErrors() {
  ["Weight", "Sleep", "Energy", "Soreness"].forEach(field => {
    setText(`error${field}`, "");
    getEl(`input${field}`)?.classList.remove("input-error");
  });
}

/**
 * Shows an inline error message under a specific check-in field.
 * @param {string} field - "Weight" | "Sleep" | "Energy" | "Soreness"
 * @param {string} message
 */
function showCheckinError(field, message) {
  setText(`error${field}`, message);
  getEl(`input${field}`)?.classList.add("input-error");
}

/**
 * Reads and validates all check-in form fields.
 * @returns {{valid: boolean, data: Object|null}}
 */
function validateCheckinForm() {
  clearCheckinErrors();
  let valid = true;

  const weightRaw = getEl("inputWeight").value.trim();
  const sleepRaw = getEl("inputSleep").value.trim();
  const energy = getEl("inputEnergy").value;
  const soreness = getEl("inputSoreness").value;

  // --- Weight ---
  if (weightRaw === "") {
    showCheckinError("Weight", "Weight is required.");
    valid = false;
  } else {
    const weight = parseFloat(weightRaw);
    if (isNaN(weight) || weight < CHECKIN_LIMITS.weight.min || weight > CHECKIN_LIMITS.weight.max) {
      showCheckinError("Weight", `Enter ${CHECKIN_LIMITS.weight.min}-${CHECKIN_LIMITS.weight.max} kg.`);
      valid = false;
    }
  }

  // --- Sleep ---
  if (sleepRaw === "") {
    showCheckinError("Sleep", "Sleep is required.");
    valid = false;
  } else {
    const sleep = parseFloat(sleepRaw);
    if (isNaN(sleep) || sleep < CHECKIN_LIMITS.sleep.min || sleep > CHECKIN_LIMITS.sleep.max) {
      showCheckinError("Sleep", `Enter ${CHECKIN_LIMITS.sleep.min}-${CHECKIN_LIMITS.sleep.max} hours.`);
      valid = false;
    }
  }

  // --- Energy ---
  if (energy === "") {
    showCheckinError("Energy", "Select an energy level.");
    valid = false;
  }

  // --- Soreness ---
  if (soreness === "") {
    showCheckinError("Soreness", "Select a soreness level.");
    valid = false;
  }

  if (!valid) return { valid: false, data: null };

  return {
    valid: true,
    data: {
      weight: parseFloat(weightRaw),
      sleep: parseFloat(sleepRaw),
      energy,
      soreness
    }
  };
}

/**
 * Briefly shows the "✓ Check-in Saved" confirmation message,
 * then fades it out after 2 seconds.
 */
function showCheckinSuccess() {
  const successEl = getEl("checkinSuccess");
  successEl.classList.add("visible");

  setTimeout(() => {
    successEl.classList.remove("visible");
  }, 2000);
}

/**
 * Handles the Save Check-in button: validates input, then (if
 * valid) pushes data through setAthleteData() — the only function
 * allowed to mutate athleteData — and updates the UI feedback.
 */
function handleSaveCheckin() {
  const { valid, data } = validateCheckinForm();
  if (!valid) return;

  setAthleteData(data);

  showCheckinSuccess();
  collapseCheckinCard();

  // TODO: Wearables — future check-ins may be auto-filled from a
  // synced device instead of requiring manual entry here.
}

/** Wires up the Check-in card's toggle and save interactions. */
function setupCheckinCard() {
  getEl("checkinToggle")?.addEventListener("click", toggleCheckinCard);
  getEl("saveCheckinBtn")?.addEventListener("click", handleSaveCheckin);
}

/* ==========================================================
   SECTION 8: NAVIGATION
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
  // TODO: Gemini AI — AI Coach responses will be generated here.
  console.log("Navigating to: ATHINA");
}

function goToSettings() {
  // TODO: Build Settings page (profile, preferences, account)
  console.log("Navigating to: Settings");
}

const NAV_HANDLERS = {
  home: goToHome,
  workout: goToWorkout,
  progress: goToProgress,
  athina: goToAthina,
  settings: goToSettings
};

/** Wires up bottom nav click handling and active-tab toggling. */
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

/** Wires up the Start Workout button. */
function setupStartButton() {
  getEl("startWorkoutBtn")?.addEventListener("click", () => {
    // TODO: Start actual workout session flow once Workout module exists.
    console.log("Workout session starting...");
  });
}

/* ==========================================================
   SECTION 9: INIT
   ========================================================== */

/**
 * Fallback demo data used only when Local Storage has no saved
 * athleteData yet (first-ever app open).
 * TODO: Firebase — once cloud accounts exist, a returning user
 * with no local data should load from the cloud before falling
 * back to this demo data.
 */
const demoAthleteData = {
  sleep: 7.5,
  energy: "High",
  soreness: "Light",
  weight: 68
};

/**
 * App entry point — sets up static UI, loads persisted or demo
 * data, and starts recurring updates.
 */
function init() {
  renderDateTime();
  setupNavigation();
  setupStartButton();
  setupCheckinCard();

  const savedData = loadAthleteDataFromStorage();
  setAthleteData(savedData || demoAthleteData);

  setInterval(renderDateTime, 30000);
}

document.addEventListener("DOMContentLoaded", init);