/* ==========================================================
   EAAS / ATHINA DASHBOARD — script.js
   Handles: greeting, live time, recovery ring, nav switching
   ========================================================== */

// ---------- 1. DYNAMIC GREETING ----------
function updateGreeting() {
  const hour = new Date().getHours();
  let text = "Good Night, Athlete";

  if (hour >= 5 && hour < 12) text = "Good Morning, Athlete";
  else if (hour >= 12 && hour < 17) text = "Good Afternoon, Athlete";
  else if (hour >= 17 && hour < 21) text = "Good Evening, Athlete";

  document.getElementById("greeting").textContent = text;
}

// ---------- 2. LIVE DATE & TIME ----------
function updateDateTime() {
  const now = new Date();

  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = now.toLocaleDateString('en-US', options);

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const timeStr = `${hours}:${minutes} ${ampm}`;

  document.getElementById("datetime").textContent = `${dateStr} • ${timeStr}`;
}

// ---------- 3. RECOVERY RING ANIMATION ----------
function setRecoveryRing(percent) {
  const ring = document.getElementById("ringFill");
  const circumference = 2 * Math.PI * 52; // r = 52
  const offset = circumference - (percent / 100) * circumference;

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;

  document.getElementById("recoveryPercent").textContent = `${percent}%`;
}

// ---------- 4. BOTTOM NAV SWITCHING ----------
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const section = item.getAttribute("data-nav");
      console.log(`Navigated to: ${section}`);
      // Future: swap visible section based on 'section' value
    });
  });
}

// ---------- 5. START WORKOUT BUTTON ----------
function setupStartButton() {
  const btn = document.getElementById("startWorkoutBtn");
  btn.addEventListener("click", () => {
    console.log("Workout session starting...");
    // Future: navigate to workout screen / start timer flow
  });
}

// ---------- INIT ----------
function init() {
  updateGreeting();
  updateDateTime();
  setRecoveryRing(82); // sample recovery value, replace with real data later
  setupNavigation();
  setupStartButton();

  // Refresh time every 30 seconds
  setInterval(updateDateTime, 30000);
}

document.addEventListener("DOMContentLoaded", init);