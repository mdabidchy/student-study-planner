

/* ==========================================
   STUDENT STUDY PLANNER
   Main JavaScript File
========================================== */


/* ==========================================
   1. HTML ELEMENTS
========================================== */

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


/* ==========================================
   2. CALENDAR SETTINGS
========================================== */

let currentCalendarView = "week";

const today = new Date();
today.setHours(0, 0, 0, 0);

// Find current week's Monday
let currentWeekStart = new Date(today);

const todayDay = currentWeekStart.getDay();

currentWeekStart.setDate(
    currentWeekStart.getDate() -
    (todayDay === 0 ? 6 : todayDay - 1)
);

// Current month
let currentMonthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);


/* ==========================================
   3. LOAD SAVED TASKS
========================================== */

let tasks = [];

try {
    tasks = JSON.parse(
        localStorage.getItem("studyTasks")
    ) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {
    tasks = [];
}


/* ==========================================
   4. SECURITY FUNCTION
========================================== */

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        function (char) {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[char];
        }
    );
}


/* ==========================================
   5. DATE FORMAT FUNCTION
========================================== */

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* ==========================================
   6. SAVE TASKS
========================================== */

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}


/* ==========================================
   7. UPDATE DASHBOARD STATISTICS
========================================== */

function updateStats() {

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = tasks.length - completed;

    document.getElementById("totalTasks").textContent =
        tasks.length;

    document.getElementById("completedTasks").textContent =
        completed;

    document.getElementById("pendingTasks").textContent =
        pending;


    // Calculate completion percentage

    const percentage = tasks.length === 0
        ? 0
        : Math.round(
            (completed / tasks.length) * 100
        );


    // Update progress bar

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "%";


    // Progress message

    let message = "Keep studying and reach your goal!";

    if (percentage === 100 && tasks.length > 0) {

        message = "Excellent! All tasks completed!";

    } else if (percentage >= 50) {

        message = "Great work! Keep going!";

    }

    document.getElementById("progressMessage").textContent =
        message;
}


/* ==========================================
   8. RENDER TASKS
========================================== */

function renderTasks() {

    const selectedFilter = filter.value;

    const searchValue = searchTask
        ? searchTask.value.toLowerCase().trim()
        : "";


    // Filter and search tasks

    const visibleTasks = tasks.filter(task => {

        const matchesFilter =
            selectedFilter === "All" ||
            (selectedFilter === "Completed" && task.completed) ||
            (selectedFilter === "Pending" && !task.completed);

        const matchesSearch =
            String(task.title || "")
                .toLowerCase()
                .includes(searchValue) ||

            String(task.subject || "")
                .toLowerCase()
                .includes(searchValue);

        return matchesFilter && matchesSearch;
    });


    // Display task cards

    taskList.innerHTML = visibleTasks.map(task => {

        const priorityClass = String(
            task.priority || "Medium"
        ).toLowerCase();

        const statusClass = task.completed
            ? "completed"
            : "pending";

        return `

            <article class="task-item ${task.completed ? "done" : ""}">

                <div class="task-content">

                    <h3 class="task-title">
                        ${escapeHTML(task.title)}
                    </h3>

                    <p class="task-details">
                        Subject: ${escapeHTML(task.subject)}
                    </p>

                    <p class="task-details">
                        Due Date: ${escapeHTML(task.dueDate)}
                    </p>

                    <div class="task-badges">

                        <span class="priority-badge ${escapeHTML(priorityClass)}">
                            ${escapeHTML(task.priority || "Medium")} Priority
                        </span>

                        <span class="status-badge ${statusClass}">
                            ${task.completed ? "Completed" : "Pending"}
                        </span>

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        type="button"
                        data-action="toggle"
                        data-id="${escapeHTML(task.id)}">

                        ${task.completed ? "Undo" : "Complete"}

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(task.id)}">

                        Delete

                    </button>

                </div>

            </article>

        `;

    }).join("");


    // Show empty message when no tasks are available

    emptyMessage.hidden = visibleTasks.length > 0;


    // Update dashboard and calendar

    updateStats();

    renderCalendar();
}


/* ==========================================
   9. RENDER WEEKLY CALENDAR
========================================== */

function renderWeeklyCalendar() {

    if (!weeklyCalendar) return;

    const monday = new Date(currentWeekStart);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);


    // Update week heading

    weekLabel.textContent =

        monday.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })

        + " - " +

        sunday.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });


    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const days = [];


    // Generate seven days

    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);

        date.setDate(monday.getDate() + i);

        const dateKey = formatDate(date);


        // Find tasks for this date

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

                <h3>
                    ${date.toLocaleDateString("en-US", {
                        weekday: "long"
                    })}
                </h3>

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


/* ==========================================
   10. RENDER MONTHLY CALENDAR
========================================== */

function renderMonthlyCalendar() {

    if (!weeklyCalendar) return;


    const firstDay = new Date(currentMonthStart);

    firstDay.setDate(1);

    const month = firstDay.getMonth();

    const year = firstDay.getFullYear();


    // Update month heading

    weekLabel.textContent =
        firstDay.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    // Weekday headings

    const weekdays = [
        "Mon", "Tue", "Wed", "Thu",
        "Fri", "Sat", "Sun"
    ];

    const days = weekdays.map(day => `

        <div class="calendar-weekday">
            ${day}
        </div>

    `);


    // Find first Monday of calendar grid

    const offset = (firstDay.getDay() + 6) % 7;

    const gridStart = new Date(firstDay);

    gridStart.setDate(1 - offset);


    // Generate 42 date boxes

    for (let i = 0; i < 42; i++) {

        const date = new Date(gridStart);

        date.setDate(gridStart.getDate() + i);

        const dateKey = formatDate(date);


        // Find tasks for this date

        const dayTasks = tasks.filter(
            task => task.dueDate === dateKey
        );


        // Display maximum two tasks

        const taskHTML = dayTasks
            .slice(0, 2)
            .map(task => `

                <div class="calendar-task ${task.completed ? "done" : ""}">
                    ${escapeHTML(task.title)}
                </div>

            `).join("");


        // Display extra task count

        const extraTasks = dayTasks.length > 2

            ? `<p class="no-calendar-task">
                +${dayTasks.length - 2} more
               </p>`

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


/* ==========================================
   11. SWITCH CALENDAR VIEW
========================================== */

function renderCalendar() {

    if (currentCalendarView === "month") {

        renderMonthlyCalendar();

    } else {

        renderWeeklyCalendar();

    }


    // Active button styling

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


/* ==========================================
   12. PREVIOUS CALENDAR BUTTON
========================================== */

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


/* ==========================================
   13. NEXT CALENDAR BUTTON
========================================== */

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


/* ==========================================
   14. TODAY BUTTON
========================================== */

todayWeek.addEventListener("click", function () {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    // Reset current week

    const day = today.getDay();

    currentWeekStart = new Date(today);

    currentWeekStart.setDate(
        currentWeekStart.getDate() -
        (day === 0 ? 6 : day - 1)
    );


    // Reset current month

    currentMonthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );


    renderCalendar();

});


/* ==========================================
   15. WEEK VIEW BUTTON
========================================== */

weekViewBtn.addEventListener("click", function () {

    currentCalendarView = "week";

    renderCalendar();

});


/* ==========================================
   16. MONTH VIEW BUTTON
========================================== */

monthViewBtn.addEventListener("click", function () {

    currentCalendarView = "month";

    renderCalendar();

});


/* ==========================================
   17. ADD NEW TASK
========================================== */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const newTask = {

        id: Date.now().toString() +
            Math.random().toString(16).slice(2),

        title: taskTitle.value.trim(),

        subject: subject.value.trim(),

        dueDate: dueDate.value,

        priority: priority.value,

        completed: false

    };


    // Validate input fields

    if (
        !newTask.title ||
        !newTask.subject ||
        !newTask.dueDate
    ) {

        return;

    }


    // Add task

    tasks.push(newTask);

    saveTasks();

    renderTasks();


    // Reset form

    taskForm.reset();

    priority.value = "Medium";

});


/* ==========================================
   18. COMPLETE / UNDO / DELETE TASKS
========================================== */

taskList.addEventListener("click", function (event) {

    const button = event.target.closest(
        "button[data-action]"
    );

    if (!button) return;


    const taskId = button.dataset.id;

    const action = button.dataset.action;


    // Complete or undo task

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


    // Delete task

    if (action === "delete") {

        tasks = tasks.filter(
            task => task.id !== taskId
        );

    }


    saveTasks();

    renderTasks();

});


/* ==========================================
   19. FILTER TASKS
========================================== */

filter.addEventListener("change", function () {

    renderTasks();

});


/* ==========================================
   20. SEARCH TASKS
========================================== */

if (searchTask) {

    searchTask.addEventListener("input", function () {

        renderTasks();

    });

}


/* ==========================================
   21. LOAD TASKS WHEN PAGE OPENS
========================================== */

renderTasks();

