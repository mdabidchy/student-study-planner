
const searchTask = document.getElementById("searchTask");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const subject = document.getElementById("subject");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const filter = document.getElementById("filter");
const emptyMessage = document.getElementById("emptyMessage");

const weeklyCalendar = document.getElementById("weeklyCalendar");
const prevWeek = document.getElementById("prevWeek");
const nextWeek = document.getElementById("nextWeek");
const todayWeek = document.getElementById("todayWeek");
const weekLabel = document.getElementById("weekLabel");

const weekViewBtn = document.getElementById("weekViewBtn");
const monthViewBtn = document.getElementById("monthViewBtn");

// Calendar settings
let currentCalendarView = "week";

let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0);

const todayDay = currentWeekStart.getDay();

currentWeekStart.setDate(
  currentWeekStart.getDate() -
  (todayDay === 0 ? 6 : todayDay - 1)
);

let currentMonthStart = new Date();
currentMonthStart.setDate(1);
currentMonthStart.setHours(0, 0, 0, 0);

// Load saved tasks
let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

// Prevent unsafe HTML input
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// Format date using local time
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Save tasks
function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Update dashboard and progress bar
function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;

  const percentage = tasks.length === 0
    ? 0
    : Math.round((completed / tasks.length) * 100);

  document.getElementById("progressBar").style.width =
    percentage + "%";

  document.getElementById("progressText").textContent =
    percentage + "%";

  const message = percentage === 100 && tasks.length > 0
    ? "Excellent! All tasks completed!"
    : percentage >= 50
    ? "Great work! Keep going!"
    : "Keep studying and reach your goal!";

  document.getElementById("progressMessage").textContent =
    message;
}

// Display tasks
function renderTasks() {
  const selectedFilter = filter.value;

  const searchValue = searchTask
    ? searchTask.value.toLowerCase().trim()
    : "";

  const visibleTasks = tasks.filter(task => {
    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Completed" && task.completed) ||
      (selectedFilter === "Pending" && !task.completed);

    const matchesSearch =
      String(task.title || "").toLowerCase().includes(searchValue) ||
      String(task.subject || "").toLowerCase().includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  taskList.innerHTML = visibleTasks.map(task => `
    <article class="task-item ${task.completed ? "done" : ""}">
      <div>
        <h3 class="task-title">${escapeHTML(task.title)}</h3>

        <p class="task-details">
          Subject: ${escapeHTML(task.subject)}<br>
          Due: ${escapeHTML(task.dueDate)}<br>
          Priority: ${escapeHTML(task.priority)}<br>
          Status: ${task.completed ? "Completed" : "Pending"}
        </p>
      </div>

      <div class="task-actions">
        <button data-action="toggle" data-id="${escapeHTML(task.id)}">
          ${task.completed ? "Undo" : "Complete"}
        </button>

        <button class="delete-btn"
          data-action="delete" data-id="${escapeHTML(task.id)}">
          Delete
        </button>
      </div>
    </article>
  `).join("");

  emptyMessage.hidden = visibleTasks.length > 0;

  updateStats();
  renderCalendar();
}

// Render weekly study calendar
function renderWeeklyCalendar() {
  if (!weeklyCalendar) return;

  const monday = new Date(currentWeekStart);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  weekLabel.textContent =
    monday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    }) +
    " - " +
    sunday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const dateKey = formatDate(date);

    const dayTasks = tasks.filter(
      task => task.dueDate === dateKey
    );

    const taskHTML = dayTasks.length > 0
      ? dayTasks.map(task => `
          <div class="calendar-task ${task.completed ? "done" : ""}">
            ${escapeHTML(task.title)}
          </div>
        `).join("")
      : `<p class="no-calendar-task">No tasks</p>`;

    days.push(`
      <div class="calendar-day ${dateKey === formatDate(today) ? "today" : ""}">
        <h3>${date.toLocaleDateString("en-US", {
          weekday: "long"
        })}</h3>

        <p class="calendar-date">
          ${date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          })}
        </p>

        ${taskHTML}
      </div>
    `);
  }

  weeklyCalendar.innerHTML = days.join("");
}

// Render monthly study calendar
function renderMonthlyCalendar() {
  if (!weeklyCalendar) return;

  const firstDay = new Date(currentMonthStart);
  firstDay.setDate(1);

  const month = firstDay.getMonth();
  const year = firstDay.getFullYear();

  weekLabel.textContent = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekdays = [
    "Mon", "Tue", "Wed", "Thu",
    "Fri", "Sat", "Sun"
  ];

  const days = weekdays.map(day => `
    <div class="calendar-weekday">${day}</div>
  `);

  const offset = (firstDay.getDay() + 6) % 7;

  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - offset);

  // Display 42 date boxes
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    const dateKey = formatDate(date);

    const dayTasks = tasks.filter(
      task => task.dueDate === dateKey
    );

    const taskHTML = dayTasks.slice(0, 2).map(task => `
      <div class="calendar-task ${task.completed ? "done" : ""}">
        ${escapeHTML(task.title)}
      </div>
    `).join("");

    const extraTasks = dayTasks.length > 2
      ? `<p class="no-calendar-task">+${dayTasks.length - 2} more</p>`
      : "";

    const isCurrentMonth =
      date.getMonth() === month &&
      date.getFullYear() === year;

    days.push(`
      <div class="calendar-day month-day
        ${isCurrentMonth ? "" : "other-month"}
        ${dateKey === formatDate(today) ? "today" : ""}">

        <h3>${date.getDate()}</h3>

        ${taskHTML}
        ${extraTasks}

      </div>
    `);
  }

  weeklyCalendar.innerHTML = days.join("");
}

// Switch between week and month calendar
function renderCalendar() {
  if (currentCalendarView === "month") {
    renderMonthlyCalendar();
  } else {
    renderWeeklyCalendar();
  }

  if (weekViewBtn && monthViewBtn) {
    weekViewBtn.classList.toggle(
      "active",
      currentCalendarView === "week"
    );

    monthViewBtn.classList.toggle(
      "active",
      currentCalendarView === "month"
    );
  }
}

// Previous button
prevWeek.addEventListener("click", function () {
  if (currentCalendarView === "week") {
    currentWeekStart.setDate(
      currentWeekStart.getDate() - 7
    );
  } else {
    currentMonthStart.setMonth(
      currentMonthStart.getMonth() - 1
    );
  }

  renderCalendar();
});

// Next button
nextWeek.addEventListener("click", function () {
  if (currentCalendarView === "week") {
    currentWeekStart.setDate(
      currentWeekStart.getDate() + 7
    );
  } else {
    currentMonthStart.setMonth(
      currentMonthStart.getMonth() + 1
    );
  }

  renderCalendar();
});

// Today button
todayWeek.addEventListener("click", function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = today.getDay();

  currentWeekStart = new Date(today);

  currentWeekStart.setDate(
    currentWeekStart.getDate() -
    (day === 0 ? 6 : day - 1)
  );

  currentMonthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  renderCalendar();
});

// Week View button
weekViewBtn.addEventListener("click", function () {
  currentCalendarView = "week";
  renderCalendar();
});

// Month View button
monthViewBtn.addEventListener("click", function () {
  

  currentCalendarView = "month";
  renderCalendar();
});

// Add new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const newTask = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title: taskTitle.value.trim(),
    subject: subject.value.trim(),
    dueDate: dueDate.value,
    priority: priority.value,
    completed: false
  };

  if (!newTask.title || !newTask.subject || !newTask.dueDate) {
    return;
  }

  tasks.push(newTask);

  saveTasks();
  renderTasks();

  taskForm.reset();
  priority.value = "Medium";
});

// Complete and delete tasks
taskList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const taskId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "toggle") {
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed
        };
      }

      return task;
    });
  }

  if (action === "delete") {
    tasks = tasks.filter(task => task.id !== taskId);
  }

  saveTasks();
  renderTasks();
});

// Filter tasks
filter.addEventListener("change", renderTasks);

// Search tasks
if (searchTask) {
  searchTask.addEventListener("input", renderTasks);
}

// Load tasks when page opens
renderTasks();

