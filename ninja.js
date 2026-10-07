// Storage Keys
const STORAGE_KEY = "habit_tracker_app_data";
const START_DATE_KEY = "habit_tracker_start_date";

// App State
let habits = [];
let dates = [];
let activeTimeframe = "current_week"; 
let startDateStr = "";

// DOM Elements
const appContainer = document.getElementById("app-container");
const habitsList = document.getElementById("habits-list");
const daysBar = document.getElementById("days-bar");
const emptyState = document.getElementById("empty-state");
const currentDateEl = document.getElementById("current-date");
const habitModal = document.getElementById("habit-modal");
const habitForm = document.getElementById("habit-form");
const habitIdInput = document.getElementById("habit-id");
const habitNameInput = document.getElementById("habit-name");
const modalTitleEl = document.getElementById("modal-title");

const openModalBtn = document.getElementById("open-add-modal-btn");
const emptyAddBtn = document.getElementById("empty-add-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelModalBtn = document.getElementById("cancel-modal-btn");

const overallPercentageEl = document.getElementById("overall-percentage");
const overallCircleEl = document.getElementById("overall-progress-circle");

const timeframeMenuBtn = document.getElementById("timeframe-menu-btn");
const timeframeDropdown = document.getElementById("timeframe-dropdown");
const statsTimeLabel = document.getElementById("stats-time-label");
const statsSubtext = document.getElementById("stats-subtext");

// Initialize Application
function init() {
  initStartDate();
  displayCurrentDate();
  loadHabits();
  setupEventListeners();
  setTimeframe(activeTimeframe);
}

// Track Day 1 (starts on the day client opens/downloads app)
function initStartDate() {
  let storedStart = localStorage.getItem(START_DATE_KEY);
  if (!storedStart) {
    storedStart = new Date().toISOString().split("T")[0];
    localStorage.setItem(START_DATE_KEY, storedStart);
  }
  startDateStr = storedStart;
}

// Display Current Date Header
function displayCurrentDate() {
  const options = { weekday: "long", month: "short", day: "numeric" };
  currentDateEl.textContent = new Date().toLocaleDateString("en-US", options);
}

// Calculate Current Week Number based on Start Date
function getCurrentWeekNumber() {
  const start = new Date(startDateStr + "T00:00:00");
  const today = new Date();
  const diffTime = Math.abs(today - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

// Set Date Array Based on Selected Timeframe
function setTimeframe(range) {
  activeTimeframe = range;
  dates = [];
  const today = new Date();

  // Reset view size modifier classes
  appContainer.classList.remove("view-wide", "view-extra-wide");

  if (range === "current_week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    const currentWeekNum = getCurrentWeekNumber();
    statsTimeLabel.textContent = `Current Week (Week ${currentWeekNum})`;
    statsSubtext.textContent = "Your performance over the last 7 days";
  } else if (range === "prev_week") {
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    statsTimeLabel.textContent = "Previous Week Performance";
    statsSubtext.textContent = "Your completion rate for the previous week";
  } else if (range === "last_2_weeks") {
    appContainer.classList.add("view-wide");
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    statsTimeLabel.textContent = "Last 2 Weeks Performance";
    statsSubtext.textContent = "Your completion rate over the last 14 days";
  } else if (range === "last_month") {
    appContainer.classList.add("view-extra-wide");
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    statsTimeLabel.textContent = "Last Month (30 Days)";
    statsSubtext.textContent = "Your performance over the last 30 days";
  } else if (range === "prev_month") {
    appContainer.classList.add("view-extra-wide");
    for (let i = 59; i >= 30; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    statsTimeLabel.textContent = "Previous Month Performance";
    statsSubtext.textContent = "Your completion rate from 1 to 2 months ago";
  } else if (range === "third_month") {
    appContainer.classList.add("view-extra-wide");
    for (let i = 89; i >= 60; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    statsTimeLabel.textContent = "3rd Month Ago Performance";
    statsSubtext.textContent = "Your completion rate from 2 to 3 months ago";
  }

  render();
}

// Load Habits
function loadHabits() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      habits = JSON.parse(data);
    } catch (e) {
      habits = [];
    }
  } else {
    habits = [
      { id: "1", name: "Read 20 pages", emoji: "📚", color: "#6366f1", completedDates: {} },
      { id: "2", name: "Drink 2L water", emoji: "💧", color: "#06b6d4", completedDates: {} }
    ];
    saveHabits();
  }
}

// Save Habits
function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// Render Days Bar Header
function renderDaysBar() {
  daysBar.innerHTML = "";
  const todayStr = new Date().toISOString().split("T")[0];

  dates.forEach((dateStr, index) => {
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 2);
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
    const isToday = dateStr === todayStr;

    const dayEl = document.createElement("div");
    dayEl.className = `day-header-item ${isToday ? "is-today" : ""}`;
    
    const showMonth = index === 0 || dayNum === 1;

    dayEl.innerHTML = `
      <span class="day-month">${showMonth ? monthName : ''}</span>
      <span class="day-name">${dayName}</span>
      <span class="day-num">${dayNum}</span>
    `;
    daysBar.appendChild(dayEl);
  });
}

// Render Habit Cards
function render() {
  renderDaysBar();
  habitsList.innerHTML = "";

  if (habits.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  habits.forEach(habit => {
    const habitCard = document.createElement("div");
    habitCard.className = "habit-card";

    let completedCount = 0;
    dates.forEach(d => {
      if (habit.completedDates[d]) completedCount++;
    });
    const percentage = dates.length > 0 ? Math.round((completedCount / dates.length) * 100) : 0;

    let daysHtml = "";
    dates.forEach(dateStr => {
      const isCompleted = !!habit.completedDates[dateStr];
      const checkStyle = isCompleted
        ? `background-color: ${habit.color}; border-color: ${habit.color};`
        : "";
      
      daysHtml += `
        <button 
          class="check-circle ${isCompleted ? "completed" : ""}" 
          style="${checkStyle}"
          data-habit-id="${habit.id}"
          data-date="${dateStr}"
          title="${dateStr}"
        >
          ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ""}
        </button>
      `;
    });

    habitCard.innerHTML = `
      <div class="habit-details">
        <div class="habit-icon" style="background-color: ${habit.color}15; color: ${habit.color};">
          ${habit.emoji}
        </div>
        <div class="habit-info-text">
          <span class="habit-title" style="color: ${habit.color}">${escapeHTML(habit.name)}</span>
          <div class="habit-stats-row">
            <span class="habit-percentage" style="color: ${habit.color}">${percentage}% success</span>
            <button class="delete-habit-btn edit-btn" data-id="${habit.id}" title="Edit Habit">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="delete-habit-btn delete-btn" data-id="${habit.id}" title="Delete Habit">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="habit-days">
        ${daysHtml}
      </div>
    `;

    habitsList.appendChild(habitCard);
  });

  updateOverallStats();
}

// Toggle Checkmark Status
function toggleHabit(habitId, dateStr) {
  const habit = habits.find(h => h.id === habitId);
  if (habit) {
    if (habit.completedDates[dateStr]) {
      delete habit.completedDates[dateStr];
    } else {
      habit.completedDates[dateStr] = true;
    }
    saveHabits();
    render();
  }
}

// Delete Habit
function deleteHabit(habitId) {
  if (confirm("Are you sure you want to delete this habit?")) {
    habits = habits.filter(h => h.id !== habitId);
    saveHabits();
    render();
  }
}

// Update Circular Progress Stats
function updateOverallStats() {
  if (habits.length === 0 || dates.length === 0) {
    overallPercentageEl.textContent = "0%";
    setRingProgress(0);
    return;
  }

  let totalPossible = habits.length * dates.length;
  let totalCompleted = 0;

  habits.forEach(habit => {
    dates.forEach(d => {
      if (habit.completedDates[d]) totalCompleted++;
    });
  });

  const totalPercentage = Math.round((totalCompleted / totalPossible) * 100);
  overallPercentageEl.textContent = `${totalPercentage}%`;
  setRingProgress(totalPercentage);
}

function setRingProgress(percent) {
  if (!overallCircleEl) return;
  const radius = overallCircleEl.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  overallCircleEl.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (percent / 100) * circumference;
  overallCircleEl.style.strokeDashoffset = offset;
}

// Setup Event Listeners
function setupEventListeners() {
  openModalBtn.addEventListener("click", () => openModal());
  emptyAddBtn.addEventListener("click", () => openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);

  // Toggle Three-dot Menu Dropdown
  timeframeMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    timeframeDropdown.classList.toggle("hidden");
  });

  // Close Dropdown on outside click
  document.addEventListener("click", () => {
    timeframeDropdown.classList.add("hidden");
  });

  // Event Delegation for Habit Actions (Toggle, Edit, Delete)
  habitsList.addEventListener("click", (e) => {
    const checkBtn = e.target.closest(".check-circle");
    if (checkBtn) {
      const habitId = checkBtn.dataset.habitId;
      const date = checkBtn.dataset.date;
      toggleHabit(habitId, date);
      return;
    }

    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      openModal(editBtn.dataset.id);
      return;
    }

    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      deleteHabit(deleteBtn.dataset.id);
      return;
    }
  });

  // Select Timeframe from Dropdown
  document.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", (e) => {
      document.querySelectorAll(".dropdown-item").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const range = e.currentTarget.dataset.range;
      setTimeframe(range);
    });
  });

  // Modal selector buttons
  document.querySelectorAll(".emoji-option").forEach(btn => {
    btn.addEventListener("click", e => {
      document.querySelectorAll(".emoji-option").forEach(b => b.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
    });
  });

  document.querySelectorAll(".color-option").forEach(btn => {
    btn.addEventListener("click", e => {
      document.querySelectorAll(".color-option").forEach(b => b.classList.remove("selected"));
      e.currentTarget.classList.add("selected");
    });
  });

  // Modal Form Submission
  habitForm.addEventListener("submit", e => {
    e.preventDefault();
    const id = habitIdInput.value;
    const name = habitNameInput.value.trim();
    const selectedEmoji = document.querySelector(".emoji-option.selected").dataset.emoji;
    const selectedColor = document.querySelector(".color-option.selected").dataset.color;

    if (!name) return;

    if (id) {
      const existingHabit = habits.find(h => h.id === id);
      if (existingHabit) {
        existingHabit.name = name;
        existingHabit.emoji = selectedEmoji;
        existingHabit.color = selectedColor;
      }
    } else {
      const newHabit = {
        id: Date.now().toString(),
        name: name,
        emoji: selectedEmoji,
        color: selectedColor,
        completedDates: {}
      };
      habits.push(newHabit);
    }

    saveHabits();
    render();
    closeModal();
  });
}

function openModal(habitId = null) {
  habitForm.reset();

  if (habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      modalTitleEl.textContent = "Edit Habit";
      habitIdInput.value = habit.id;
      habitNameInput.value = habit.name;

      document.querySelectorAll(".emoji-option").forEach(b => {
        b.classList.toggle("selected", b.dataset.emoji === habit.emoji);
      });

      document.querySelectorAll(".color-option").forEach(b => {
        b.classList.toggle("selected", b.dataset.color === habit.color);
      });
    }
  } else {
    modalTitleEl.textContent = "New Habit";
    habitIdInput.value = "";
    document.querySelectorAll(".emoji-option").forEach((b, i) => b.classList.toggle("selected", i === 0));
    document.querySelectorAll(".color-option").forEach((b, i) => b.classList.toggle("selected", i === 0));
  }

  habitModal.classList.remove("hidden");
}

function closeModal() {
  habitModal.classList.add("hidden");
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

document.addEventListener("DOMContentLoaded", init);