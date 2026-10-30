
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const subject = document.getElementById("subject");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const filter = document.getElementById("filter");
const emptyMessage = document.getElementById("emptyMessage");
const searchTask = document.getElementById("searchTask");

// Save করা task browser থেকে load করা
let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
} catch {
  tasks = [];
}

// User-এর লেখা HTML হিসেবে execute হওয়া ঠেকায়
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

// Task browser-এর localStorage-এ save করা
function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Dashboard-এর সংখ্যা update করা

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

  // Calculate study progress
  const percentage = tasks.length === 0
    ? 0
    : Math.round((completed / tasks.length) * 100);

  // Update progress bar
  document.getElementById("progressBar").style.width =
    percentage + "%";

  document.getElementById("progressText").textContent =
    percentage + "%";

  // Update progress message
  const message = percentage === 100 && tasks.length > 0
    ? "Excellent! All tasks completed!"
    : percentage >= 50
    ? "Great work! Keep going!"
    : "Keep studying and reach your goal!";

  document.getElementById("progressMessage").textContent =
    message;
}


// Task screen-এ দেখানো
function renderTasks() {
 
const selectedFilter = filter.value;
const searchValue = searchTask.value.toLowerCase().trim();

const visibleTasks = tasks.filter(task => {
  const matchesFilter =
    selectedFilter === "All" ||
    (selectedFilter === "Completed" && task.completed) ||
    (selectedFilter === "Pending" && !task.completed);

  const matchesSearch =
    task.title.toLowerCase().includes(searchValue) ||
    task.subject.toLowerCase().includes(searchValue);

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
        <button data-action="toggle" data-id="${task.id}">
          ${task.completed ? "Undo" : "Complete"}
        </button>

        <button class="delete-btn"
          data-action="delete" data-id="${task.id}">
          Delete
        </button>
      </div>
    </article>
  `).join("");

  emptyMessage.hidden = visibleTasks.length > 0;
  updateStats();
}

// Form submit হলে নতুন task তৈরি করা
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

// Complete এবং Delete button-এর কাজ
taskList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const taskId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "toggle") {
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
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

// Filter পরিবর্তন হলে তালিকা update করা
filter.addEventListener("change", renderTasks);

// Page খুললেই আগের task দেখানো
renderTasks();

searchTask.addEventListener("input", renderTasks);

