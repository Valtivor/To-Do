// ==========================================
// VTASKBASE APP
// ==========================================


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const taskForm = document.getElementById("task-form");

const taskInput = document.getElementById("task-input");

const areaInput = document.getElementById("area-input");

const deadlineInput = document.getElementById("deadline-input");

const taskList = document.getElementById("task-list");

const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search-input");

const sortSelect = document.getElementById("sort-select");

const filterButtons =
    document.querySelectorAll(".filter-btn");


// Dashboard

const totalCount =
    document.getElementById("total-count");

const completedCount =
    document.getElementById("completed-count");

const pendingCount =
    document.getElementById("pending-count");

const overdueCount =
    document.getElementById("overdue-count");


// Progress

const progressPercent =
    document.getElementById("progress-percent");

const progressFill =
    document.getElementById("progress-fill");


// Focus

const focusTitle =
    document.getElementById("focus-title");

const focusText =
    document.getElementById("focus-text");


// Edit modal

const editModal =
    document.getElementById("edit-modal");

const editForm =
    document.getElementById("edit-form");

const editTask =
    document.getElementById("edit-task");

const editArea =
    document.getElementById("edit-area");

const editDeadline =
    document.getElementById("edit-deadline");

const closeModal =
    document.getElementById("close-modal");

const cancelEdit =
    document.getElementById("cancel-edit");


// Theme

const themeBtn =
    document.getElementById("theme-btn");


// Install

const installBtn =
    document.getElementById("install-btn");


// ==========================================
// DATA
// ==========================================

let tasks =
    JSON.parse(
        localStorage.getItem("vtaskbase_tasks")
    ) || [];

let currentFilter = "all";

let editingTaskId = null;

let deferredPrompt = null;


// ==========================================
// SAVE TASKS
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "vtaskbase_tasks",
        JSON.stringify(tasks)
    );

}


// ==========================================
// DATE/TIME PARSER
// ==========================================

// datetime-local gives us something like:
//
// 2026-09-23T18:30
//
// We manually turn that into a JavaScript Date
// using the user's local time.

function getLocalDateTime(value) {

    if (!value) {
        return null;
    }


    // datetime-local

    if (value.includes("T")) {

        const parts =
            value.split("T");


        if (parts.length !== 2) {
            return null;
        }


        const dateParts =
            parts[0]
                .split("-")
                .map(Number);

        const timeParts =
            parts[1]
                .split(":")
                .map(Number);


        if (
            dateParts.length !== 3 ||
            timeParts.length < 2
        ) {
            return null;
        }


        const year =
            dateParts[0];

        const month =
            dateParts[1] - 1;

        const day =
            dateParts[2];

        const hour =
            timeParts[0];

        const minute =
            timeParts[1];

        const second =
            timeParts.length >= 3
                ? timeParts[2]
                : 0;


        const date =
            new Date(
                year,
                month,
                day,
                hour,
                minute,
                second,
                0
            );


        if (isNaN(date.getTime())) {
            return null;
        }


        return date;
    }


    // Old date-only format

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const dateParts =
            value
                .split("-")
                .map(Number);


        const year =
            dateParts[0];

        const month =
            dateParts[1] - 1;

        const day =
            dateParts[2];


        const date =
            new Date(
                year,
                month,
                day,
                23,
                59,
                59,
                999
            );


        if (isNaN(date.getTime())) {
            return null;
        }


        return date;
    }


    return null;
}


// ==========================================
// GET DEADLINE
// ==========================================

function getDeadlineTime(task) {

    if (!task.deadline) {
        return null;
    }

    return getLocalDateTime(task.deadline);

}


// ==========================================
// FORMAT DEADLINE
// ==========================================

function formatDeadline(value) {

    const date =
        getLocalDateTime(value);


    if (!date) {
        return "No deadline";
    }


    return date.toLocaleString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// COUNTDOWN
// ==========================================

function getCountdown(task) {

    if (task.completed) {

        return {
            text: "Completed",
            className: "completed-countdown"
        };

    }


    const deadline =
        getDeadlineTime(task);


    if (!deadline) {

        return {
            text: "No deadline",
            className: "normal"
        };

    }


    const now =
        new Date();


    const difference =
        deadline.getTime() -
        now.getTime();


    // Task is overdue

    if (difference <= 0) {

        return {
            text: "OVERDUE",
            className: "overdue"
        };

    }


    // Convert milliseconds

    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const days =
        Math.floor(
            totalSeconds / 86400
        );


    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    let text = "";


    if (days > 0) {

        text =
            `${days}d ${hours}h ${minutes}m`;

    }

    else if (hours > 0) {

        text =
            `${hours}h ${minutes}m ${seconds}s`;

    }

    else {

        text =
            `${minutes}m ${seconds}s`;

    }


    let className = "normal";


    // Less than one hour

    if (difference < 60 * 60 * 1000) {
        className = "soon";
    }


    return {
        text,
        className
    };

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// ==========================================
// RENDER TASKS
// ==========================================

function renderTasks() {

    let visibleTasks =
        [...tasks];


    // ======================================
    // FILTER
    // ======================================

    if (currentFilter === "pending") {

        visibleTasks =
            visibleTasks.filter(
                task => !task.completed
            );

    }


    if (currentFilter === "completed") {

        visibleTasks =
            visibleTasks.filter(
                task => task.completed
            );

    }


    if (currentFilter === "overdue") {

        visibleTasks =
            visibleTasks.filter(task => {

                if (task.completed) {
                    return false;
                }

                const deadline =
                    getDeadlineTime(task);

                return (
                    deadline &&
                    deadline.getTime() <= Date.now()
                );

            });

    }


    // ======================================
    // SEARCH
    // ======================================

    const searchTerm =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    if (searchTerm) {

        visibleTasks =
            visibleTasks.filter(task => {

                return (
                    task.title
                        .toLowerCase()
                        .includes(searchTerm)
                    ||
                    task.area
                        .toLowerCase()
                        .includes(searchTerm)
                );

            });

    }


    // ======================================
    // SORT
    // ======================================

    const sortType =
        sortSelect
            ? sortSelect.value
            : "newest";


    if (sortType === "newest") {

        visibleTasks.sort(
            (a, b) =>
                b.createdAt - a.createdAt
        );

    }


    if (sortType === "oldest") {

        visibleTasks.sort(
            (a, b) =>
                a.createdAt - b.createdAt
        );

    }


    if (sortType === "alphabetical") {

        visibleTasks.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    if (sortType === "deadline") {

        visibleTasks.sort(
            (a, b) => {

                const deadlineA =
                    getDeadlineTime(a);

                const deadlineB =
                    getDeadlineTime(b);


                if (!deadlineA) {
                    return 1;
                }

                if (!deadlineB) {
                    return -1;
                }


                return (
                    deadlineA.getTime() -
                    deadlineB.getTime()
                );

            }
        );

    }


    // ======================================
    // CLEAR LIST
    // ======================================

    taskList.innerHTML = "";


    // ======================================
    // EMPTY STATE
    // ======================================

    if (visibleTasks.length === 0) {

        emptyState.style.display =
            "block";

    }

    else {

        emptyState.style.display =
            "none";

    }


    // ======================================
    // CREATE TASK CARDS
    // ======================================

    visibleTasks.forEach(task => {

        const countdown =
            getCountdown(task);


        const card =
            document.createElement("div");


        card.className =
            "task-card";


        if (task.completed) {

            card.classList.add(
                "completed"
            );

        }


        card.innerHTML = `

            <div class="task-main">

                <button
                    class="complete-btn"
                    data-id="${task.id}"
                    title="Complete task"
                >
                    ${task.completed ? "✓" : ""}
                </button>


                <div class="task-info">

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                    <div class="task-meta">

                        <span class="task-area">
                            ${escapeHTML(task.area || "General")}
                        </span>

                        <span>
                            ${formatDeadline(task.deadline)}
                        </span>

                    </div>

                </div>

            </div>


            <div class="task-right">

                <span
                    class="countdown ${countdown.className}"
                >
                    ${countdown.text}
                </span>


                <div class="task-actions">

                    <button
                        class="edit-btn"
                        data-id="${task.id}"
                        title="Edit task"
                    >
                        ✎
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${task.id}"
                        title="Delete task"
                    >
                        ×
                    </button>

                </div>

            </div>

        `;


        taskList.appendChild(card);

    });


    updateDashboard();

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const overdue =
        tasks.filter(task => {

            if (task.completed) {
                return false;
            }


            const deadline =
                getDeadlineTime(task);


            return (
                deadline &&
                deadline.getTime() <= Date.now()
            );

        }).length;


    totalCount.textContent =
        total;


    completedCount.textContent =
        completed;


    pendingCount.textContent =
        pending;


    overdueCount.textContent =
        overdue;


    // ======================================
    // PROGRESS
    // ======================================

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    progressPercent.textContent =
        `${percentage}%`;


    progressFill.style.width =
        `${percentage}%`;


    // ======================================
    // FOCUS MESSAGE
    // ======================================

    if (total === 0) {

        focusTitle.textContent =
            "Stay focused.";

        focusText.textContent =
            "One task at a time. Keep making progress.";

    }

    else if (completed === total) {

        focusTitle.textContent =
            "Everything is complete.";

        focusText.textContent =
            "You finished all your tasks. Keep the momentum going.";

    }

    else if (overdue > 0) {

        focusTitle.textContent =
            "Time to catch up.";

        focusText.textContent =
            `You have ${overdue} overdue task${overdue === 1 ? "" : "s"}.`;

    }

    else {

        focusTitle.textContent =
            "Keep moving.";

        focusText.textContent =
            `${pending} task${pending === 1 ? "" : "s"} still waiting for you.`;

    }

}


// ==========================================
// ADD TASK
// ==========================================

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const title =
            taskInput.value.trim();


        if (!title) {
            return;
        }


        // IMPORTANT:
        // area-input is a SELECT dropdown.
        // So we use .value directly.

        const area =
            areaInput
                ? areaInput.value
                : "General";


        const deadline =
            deadlineInput.value;


        const newTask = {

            id:
                Date.now(),

            title:
                title,

            area:
                area || "General",

            deadline:
                deadline || "",

            completed:
                false,

            createdAt:
                Date.now()

        };


        tasks.push(
            newTask
        );


        saveTasks();


        // Clear only task/deadline.
        // Keep the area dropdown selected.

        taskInput.value = "";

        deadlineInput.value = "";


        renderTasks();

    }
);


// ==========================================
// COMPLETE TASK
// ==========================================

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {
                    ...task,
                    completed:
                        !task.completed
                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

}


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    renderTasks();

}


// ==========================================
// TASK BUTTON EVENTS
// ==========================================

taskList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const id =
            Number(button.dataset.id);


        if (button.classList.contains("complete-btn")) {

            toggleTask(id);

        }


        if (button.classList.contains("delete-btn")) {

            deleteTask(id);

        }


        if (button.classList.contains("edit-btn")) {

            openEditModal(id);

        }

    }
);


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {
        return;
    }


    editingTaskId =
        id;


    editTask.value =
        task.title;


    // IMPORTANT:
    // Restore the selected area.

    if (editArea) {

        editArea.value =
            task.area || "School";

    }


    editDeadline.value =
        task.deadline || "";


    editModal.classList.add(
        "show"
    );

}


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    editModal.classList.remove(
        "show"
    );


    editingTaskId =
        null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


// Close if user clicks outside modal

editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editModal
        ) {

            closeEditModal();

        }

    }
);


// ==========================================
// SAVE EDIT
// ==========================================

editForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (editingTaskId === null) {
            return;
        }


        tasks =
            tasks.map(task => {

                if (
                    task.id !== editingTaskId
                ) {

                    return task;

                }


                return {

                    ...task,

                    title:
                        editTask.value.trim(),

                    area:
                        editArea
                            ? editArea.value
                            : task.area,

                    deadline:
                        editDeadline.value

                };

            });


        saveTasks();


        closeEditModal();


        renderTasks();

    }
);


// ==========================================
// FILTER BUTTONS
// ==========================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderTasks();

            }
        );

    }
);


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


// ==========================================
// SORT
// ==========================================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        renderTasks
    );

}


// ==========================================
// LIVE COUNTDOWN
// ==========================================

// Re-render every second so the countdown
// changes automatically.

setInterval(
    function () {

        renderTasks();

    },
    1000
);


// ==========================================
// THEME
// ==========================================

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-theme"
            );


            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );


            themeBtn.textContent =
                isLight
                    ? "🌙"
                    : "☀";


            localStorage.setItem(
                "vtaskbase_theme",
                isLight
                    ? "light"
                    : "dark"
            );

        }
    );

}


// Load saved theme

const savedTheme =
    localStorage.getItem(
        "vtaskbase_theme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );


    if (themeBtn) {
        themeBtn.textContent = "🌙";
    }

}


// ==========================================
// PWA INSTALL
// ==========================================

window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();


        deferredPrompt =
            event;


        if (installBtn) {

            installBtn.style.display =
                "block";

        }

    }
);


// Install button

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (!deferredPrompt) {

                alert(
                    "VTASKBASE cannot be installed from this browser right now. Make sure you are using a supported browser and that the site is opened through HTTPS."
                );

                return;

            }


            deferredPrompt.prompt();


            const choice =
                await deferredPrompt.userChoice;


            if (
                choice.outcome === "accepted"
            ) {

                console.log(
                    "VTASKBASE installation accepted."
                );

            }


            deferredPrompt =
                null;


            installBtn.style.display =
                "none";

        }
    );

}


// ==========================================
// SERVICE WORKER
// ==========================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function () {

                        console.log(
                            "VTASKBASE service worker registered."
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}


// ==========================================
// INITIAL LOAD
// ==========================================

renderTasks();