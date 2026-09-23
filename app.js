// ===============================
// GET HTML ELEMENTS
// ===============================

const taskInput = document.getElementById("task-input");
const areaInput = document.getElementById("area-input");
const priorityInput = document.getElementById("priority-input");
const deadlineInput = document.getElementById("deadline-input");

const addTaskBtn = document.getElementById("add-task-btn");

const taskList = document.getElementById("task-list");

const searchInput = document.getElementById("search-input");
const areaFilter = document.getElementById("area-filter");
const priorityFilter = document.getElementById("priority-filter");
const sortSelect = document.getElementById("sort-select");

const clearBtn = document.getElementById("clear-btn");
const themeBtn = document.getElementById("theme-btn");
const installBtn = document.getElementById("install-btn");


// ===============================
// LOAD TASKS
// ===============================

let tasks =
    JSON.parse(
        localStorage.getItem("vtaskbase_tasks")
    ) || [];


// ===============================
// SAVE TASKS
// ===============================

function saveTasks() {

    localStorage.setItem(
        "vtaskbase_tasks",
        JSON.stringify(tasks)
    );

}


// ===============================
// CONVERT DATETIME-LOCAL
// TO REAL LOCAL TIME
// ===============================

function getLocalDateTime(value) {

    if (!value) {
        return null;
    }

    /*
        datetime-local gives something like:

        2026-09-23T17:30

        It does NOT contain a timezone.

        We manually create the Date so that
        17:30 means 5:30 PM on the user's
        local clock.
    */

    if (value.includes("T")) {

        const parts = value.split("T");

        if (parts.length !== 2) {
            return null;
        }

        const dateParts =
            parts[0].split("-").map(Number);

        const timeParts =
            parts[1].split(":").map(Number);

        if (
            dateParts.length !== 3 ||
            timeParts.length < 2
        ) {
            return null;
        }

        const year = dateParts[0];
        const month = dateParts[1] - 1;
        const day = dateParts[2];

        const hour = timeParts[0];
        const minute = timeParts[1];

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


    /*
        This also supports older tasks that
        may have been saved using only:

        2026-09-23

        Such a task is treated as ending
        at 11:59:59 PM on that day.
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const dateParts =
            value.split("-").map(Number);

        const year = dateParts[0];
        const month = dateParts[1] - 1;
        const day = dateParts[2];

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


// ===============================
// GET DEADLINE TIMESTAMP
// ===============================

function getDeadlineTime(deadline) {

    const date =
        getLocalDateTime(deadline);

    if (!date) {
        return null;
    }

    return date.getTime();
}


// ===============================
// FORMAT DEADLINE
// ===============================

function formatDeadline(deadline) {

    const date =
        getLocalDateTime(deadline);

    if (!date) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// ===============================
// GET COUNTDOWN
// ===============================

function getCountdown(deadline) {

    const deadlineTime =
        getDeadlineTime(deadline);

    if (deadlineTime === null) {

        return {
            text: "NO DEADLINE",
            className: "normal"
        };

    }

    const now = Date.now();

    const difference =
        deadlineTime - now;


    // ===========================
    // DEADLINE HAS PASSED
    // ===========================

    if (difference <= 0) {

        return {
            text: "OVERDUE",
            className: "overdue"
        };

    }


    // ===========================
    // CONVERT TO SECONDS
    // ===========================

    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    // ===========================
    // CALCULATE TIME
    // ===========================

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


    // DAYS

    if (days > 0) {

        text += `${days}d `;

    }


    // HOURS

    text +=
        `${String(hours).padStart(2, "0")}h `;


    // MINUTES

    text +=
        `${String(minutes).padStart(2, "0")}m `;


    // SECONDS

    text +=
        `${String(seconds).padStart(2, "0")}s`;


    // ===========================
    // COUNTDOWN COLOR
    // ===========================

    const className =
        difference <= 60 * 60 * 1000
            ? "soon"
            : "normal";


    return {
        text: text,
        className: className
    };

}


// ===============================
// GET VISIBLE TASKS
// ===============================

function getVisibleTasks() {

    let visibleTasks = [...tasks];


    const search =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


    const selectedArea =
        areaFilter
            ? areaFilter.value
            : "all";


    const selectedPriority =
        priorityFilter
            ? priorityFilter.value
            : "all";


    // ===========================
    // SEARCH
    // ===========================

    if (search) {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return (

                        task.title
                            .toLowerCase()
                            .includes(search)

                        ||

                        task.area
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    // ===========================
    // AREA FILTER
    // ===========================

    if (
        selectedArea &&
        selectedArea !== "all"
    ) {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return (
                        task.area === selectedArea
                    );

                }
            );

    }


    // ===========================
    // PRIORITY FILTER
    // ===========================

    if (
        selectedPriority &&
        selectedPriority !== "all"
    ) {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return (
                        task.priority ===
                        selectedPriority
                    );

                }
            );

    }


    // ===========================
    // SORT
    // ===========================

    if (sortSelect) {

        const sort =
            sortSelect.value;


        // NEWEST

        if (sort === "newest") {

            visibleTasks.sort(
                function (a, b) {

                    return (
                        b.createdAt -
                        a.createdAt
                    );

                }
            );

        }


        // OLDEST

        if (sort === "oldest") {

            visibleTasks.sort(
                function (a, b) {

                    return (
                        a.createdAt -
                        b.createdAt
                    );

                }
            );

        }


        // DEADLINE

        if (sort === "deadline") {

            visibleTasks.sort(
                function (a, b) {

                    const aTime =
                        getDeadlineTime(
                            a.deadline
                        );

                    const bTime =
                        getDeadlineTime(
                            b.deadline
                        );


                    if (aTime === null) {
                        return 1;
                    }

                    if (bTime === null) {
                        return -1;
                    }


                    return aTime - bTime;

                }
            );

        }


        // PRIORITY

        if (sort === "priority") {

            const priorityOrder = {
                high: 1,
                medium: 2,
                low: 3
            };


            visibleTasks.sort(
                function (a, b) {

                    return (
                        priorityOrder[a.priority] -
                        priorityOrder[b.priority]
                    );

                }
            );

        }

    }


    return visibleTasks;

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// ===============================
// RENDER TASKS
// ===============================

function renderTasks() {

    if (!taskList) {
        return;
    }


    const visibleTasks =
        getVisibleTasks();


    taskList.innerHTML = "";


    // ===========================
    // NO TASKS
    // ===========================

    if (visibleTasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty-state">

                <h3>
                    No tasks found
                </h3>

                <p>
                    Add a task or change your filters.
                </p>

            </div>

        `;

        updateDashboard();

        return;
    }


    // ===========================
    // CREATE TASK CARDS
    // ===========================

    visibleTasks.forEach(
        function (task) {

            const card =
                document.createElement("div");


            card.className =
                "task-card";


            if (task.completed) {

                card.classList.add(
                    "completed"
                );

            }


            const countdown =
                getCountdown(
                    task.deadline
                );


            let countdownHTML = "";


            if (task.deadline) {

                if (task.completed) {

                    countdownHTML = `

                        <span
                            class="countdown completed-countdown"
                        >
                            ✓ Completed
                        </span>

                    `;

                }

                else if (countdown) {

                    countdownHTML = `

                        <span
                            class="countdown ${countdown.className}"
                            data-deadline="${escapeHTML(
                                task.deadline
                            )}"
                            data-id="${task.id}"
                        >
                            ⏳ ${countdown.text}
                        </span>

                    `;

                }

            }


            card.innerHTML = `

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        data-id="${task.id}"
                        ${
                            task.completed
                                ? "checked"
                                : ""
                        }
                    >


                    <div class="task-info">

                        <h3>
                            ${escapeHTML(
                                task.title
                            )}
                        </h3>


                        <div class="task-meta">

                            <span>
                                ${escapeHTML(
                                    task.area
                                )}
                            </span>


                            <span
                                class="priority-${task.priority}"
                            >
                                ${task.priority}
                            </span>


                            ${
                                task.deadline
                                    ? `
                                        <span>
                                            📅
                                            ${formatDeadline(
                                                task.deadline
                                            )}
                                        </span>
                                    `
                                    : ""
                            }


                            ${countdownHTML}

                        </div>

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="edit-btn"
                        data-id="${task.id}"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        data-id="${task.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            taskList.appendChild(card);

        }
    );


    // ===========================
    // CHECKBOX EVENTS
    // ===========================

    document
        .querySelectorAll(".task-checkbox")
        .forEach(
            function (checkbox) {

                checkbox.addEventListener(
                    "change",
                    function () {

                        toggleTask(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    // ===========================
    // EDIT EVENTS
    // ===========================

    document
        .querySelectorAll(".edit-btn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openEditModal(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    // ===========================
    // DELETE EVENTS
    // ===========================

    document
        .querySelectorAll(".delete-btn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteTask(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    updateDashboard();

}


// ===============================
// UPDATE COUNTDOWNS
// ===============================

function updateCountdowns() {

    const countdowns =
        document.querySelectorAll(
            ".countdown[data-deadline]"
        );


    countdowns.forEach(
        function (element) {

            const deadline =
                element.dataset.deadline;


            const countdown =
                getCountdown(deadline);


            if (!countdown) {
                return;
            }


            element.textContent =
                `⏳ ${countdown.text}`;


            element.classList.remove(
                "normal",
                "soon",
                "overdue"
            );


            element.classList.add(
                countdown.className
            );

        }
    );


    updateDashboard();

}


// ===============================
// RUN COUNTDOWN EVERY SECOND
// ===============================

setInterval(
    updateCountdowns,
    1000
);


// ===============================
// ADD TASK
// ===============================

function addTask() {

    if (!taskInput) {
        return;
    }


    const title =
        taskInput.value.trim();


    const area =
        areaInput
            ? areaInput.value.trim()
            : "General";


    const priority =
        priorityInput
            ? priorityInput.value
            : "medium";


    const deadline =
        deadlineInput
            ? deadlineInput.value
            : "";


    // ===========================
    // CHECK TITLE
    // ===========================

    if (!title) {

        alert(
            "Please enter a task."
        );

        return;
    }


    // ===========================
    // CHECK DEADLINE
    // ===========================

    if (deadline) {

        const deadlineTime =
            getDeadlineTime(deadline);


        if (deadlineTime === null) {

            alert(
                "Please choose a valid deadline."
            );

            return;
        }


        if (
            deadlineTime <= Date.now()
        ) {

            alert(
                "Please choose a future deadline."
            );

            return;
        }

    }


    // ===========================
    // CREATE TASK
    // ===========================

    const newTask = {

        id:
            Date.now().toString(),

        title:
            title,

        area:
            area || "General",

        priority:
            priority,

        deadline:
            deadline,

        completed:
            false,

        createdAt:
            Date.now()

    };


    tasks.unshift(
        newTask
    );


    saveTasks();

    renderTasks();


    // ===========================
    // CLEAR INPUTS
    // ===========================

    taskInput.value = "";


    if (areaInput) {
        areaInput.value = "";
    }


    if (deadlineInput) {
        deadlineInput.value = "";
    }

}


// ===============================
// TOGGLE TASK
// ===============================

function toggleTask(id) {

    tasks =
        tasks.map(
            function (task) {

                if (task.id === id) {

                    return {

                        ...task,

                        completed:
                            !task.completed

                    };

                }


                return task;

            }
        );


    saveTasks();

    renderTasks();

}


// ===============================
// DELETE TASK
// ===============================

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(
            function (task) {

                return (
                    task.id !== id
                );

            }
        );


    saveTasks();

    renderTasks();

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        tasks.filter(
            function (task) {

                return !task.completed;

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                const deadlineTime =
                    getDeadlineTime(
                        task.deadline
                    );


                return (

                    !task.completed &&

                    deadlineTime !== null &&

                    deadlineTime <=
                    Date.now()

                );

            }
        ).length;


    const totalElement =
        document.getElementById(
            "total-count"
        );


    const completedElement =
        document.getElementById(
            "completed-count"
        );


    const pendingElement =
        document.getElementById(
            "pending-count"
        );


    const overdueElement =
        document.getElementById(
            "overdue-count"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (overdueElement) {

        overdueElement.textContent =
            overdue;

    }


    // ===========================
    // PROGRESS
    // ===========================

    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    const progressBar =
        document.getElementById(
            "progress-bar"
        );


    const progressText =
        document.getElementById(
            "progress-text"
        );


    if (progressBar) {

        progressBar.style.width =
            progress + "%";

    }


    if (progressText) {

        progressText.textContent =
            progress + "%";

    }

}


// ===============================
// OPEN EDIT MODAL
// ===============================

function openEditModal(id) {

    const task =
        tasks.find(
            function (task) {

                return (
                    task.id === id
                );

            }
        );


    if (!task) {
        return;
    }


    const modal =
        document.getElementById(
            "edit-modal"
        );


    const editTitle =
        document.getElementById(
            "edit-title"
        );


    const editArea =
        document.getElementById(
            "edit-area"
        );


    const editPriority =
        document.getElementById(
            "edit-priority"
        );


    const editDeadline =
        document.getElementById(
            "edit-deadline"
        );


    if (editTitle) {

        editTitle.value =
            task.title;

    }


    if (editArea) {

        editArea.value =
            task.area;

    }


    if (editPriority) {

        editPriority.value =
            task.priority;

    }


    if (editDeadline) {

        editDeadline.value =
            task.deadline || "";

    }


    if (modal) {

        modal.dataset.id =
            id;


        modal.style.display =
            "flex";

    }

}


// ===============================
// CLOSE EDIT MODAL
// ===============================

function closeEditModal() {

    const modal =
        document.getElementById(
            "edit-modal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ===============================
// SAVE EDIT
// ===============================

function saveEdit() {

    const modal =
        document.getElementById(
            "edit-modal"
        );


    if (!modal) {
        return;
    }


    const id =
        modal.dataset.id;


    const editTitle =
        document.getElementById(
            "edit-title"
        );


    const editArea =
        document.getElementById(
            "edit-area"
        );


    const editPriority =
        document.getElementById(
            "edit-priority"
        );


    const editDeadline =
        document.getElementById(
            "edit-deadline"
        );


    const newDeadline =
        editDeadline
            ? editDeadline.value
            : "";


    // ===========================
    // CHECK DEADLINE
    // ===========================

    if (newDeadline) {

        const deadlineTime =
            getDeadlineTime(
                newDeadline
            );


        if (deadlineTime === null) {

            alert(
                "Please choose a valid deadline."
            );

            return;
        }


        if (
            deadlineTime <= Date.now()
        ) {

            alert(
                "Please choose a future deadline."
            );

            return;
        }

    }


    // ===========================
    // UPDATE TASK
    // ===========================

    tasks =
        tasks.map(
            function (task) {

                if (task.id === id) {

                    return {

                        ...task,

                        title:
                            editTitle
                                ? editTitle.value.trim()
                                : task.title,

                        area:
                            editArea
                                ? editArea.value.trim() ||
                                  "General"
                                : task.area,

                        priority:
                            editPriority
                                ? editPriority.value
                                : task.priority,

                        deadline:
                            newDeadline

                    };

                }


                return task;

            }
        );


    saveTasks();

    renderTasks();

    closeEditModal();

}


// ===============================
// ADD TASK BUTTON
// ===============================

if (addTaskBtn) {

    addTaskBtn.addEventListener(
        "click",
        addTask
    );

}


// ===============================
// ENTER KEY
// ===============================

if (taskInput) {

    taskInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                addTask();

            }

        }
    );

}


// ===============================
// SEARCH
// ===============================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


// ===============================
// AREA FILTER
// ===============================

if (areaFilter) {

    areaFilter.addEventListener(
        "change",
        renderTasks
    );

}


// ===============================
// PRIORITY FILTER
// ===============================

if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        renderTasks
    );

}


// ===============================
// SORT
// ===============================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        renderTasks
    );

}


// ===============================
// CLEAR COMPLETED
// ===============================

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        function () {

            tasks =
                tasks.filter(
                    function (task) {

                        return !task.completed;

                    }
                );


            saveTasks();

            renderTasks();

        }
    );

}


// ===============================
// THEME
// ===============================

function applyTheme() {

    const savedTheme =
        localStorage.getItem(
            "vtaskbase_theme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );


        if (themeBtn) {

            themeBtn.textContent =
                "🌙";

        }

    }
    else {

        document.body.classList.remove(
            "light-theme"
        );


        if (themeBtn) {

            themeBtn.textContent =
                "☀";

        }

    }

}


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


            localStorage.setItem(
                "vtaskbase_theme",
                isLight
                    ? "light"
                    : "dark"
            );


            themeBtn.textContent =
                isLight
                    ? "🌙"
                    : "☀";

        }
    );

}


applyTheme();


// ===============================
// EDIT MODAL BUTTONS
// ===============================

const closeEditBtn =
    document.getElementById(
        "close-edit"
    );


const cancelEditBtn =
    document.getElementById(
        "cancel-edit"
    );


const saveEditBtn =
    document.getElementById(
        "save-edit"
    );


if (closeEditBtn) {

    closeEditBtn.addEventListener(
        "click",
        closeEditModal
    );

}


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        closeEditModal
    );

}


if (saveEditBtn) {

    saveEditBtn.addEventListener(
        "click",
        saveEdit
    );

}


// ===============================
// PWA INSTALL
// ===============================

let deferredPrompt = null;


// Keep install button visible

if (installBtn) {

    installBtn.style.display =
        "block";

}


// ===============================
// BEFORE INSTALL PROMPT
// ===============================

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


// ===============================
// INSTALL BUTTON
// ===============================

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (deferredPrompt) {

                deferredPrompt.prompt();


                const result =
                    await deferredPrompt.userChoice;


                if (
                    result.outcome ===
                    "accepted"
                ) {

                    installBtn.style.display =
                        "none";

                }


                deferredPrompt =
                    null;

                return;

            }


            alert(
                "VTASKBASE cannot show the install prompt right now. Please open the website in Chrome and try again."
            );

        }
    );

}


// ===============================
// APP INSTALLED
// ===============================

window.addEventListener(
    "appinstalled",
    function () {

        if (installBtn) {

            installBtn.style.display =
                "none";

        }


        deferredPrompt =
            null;

    }
);


// ===============================
// START VTASKBASE
// ===============================

renderTasks();