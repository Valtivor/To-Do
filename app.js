// ===============================
// VTASKBASE
// TASK MANAGER JAVASCRIPT
// ===============================


// ===============================
// GET HTML ELEMENTS
// ===============================

const taskInput =
    document.getElementById("task-input");

const areaInput =
    document.getElementById("area-input");

const priorityInput =
    document.getElementById("priority-input");

const deadlineInput =
    document.getElementById("deadline-input");

const addTaskBtn =
    document.getElementById("add-task-btn");

const taskList =
    document.getElementById("task-list");

const emptyState =
    document.getElementById("empty-state");

const searchInput =
    document.getElementById("search-input");

const areaFilter =
    document.getElementById("area-filter");

const priorityFilter =
    document.getElementById("priority-filter");

const sortSelect =
    document.getElementById("sort-select");

const clearAllBtn =
    document.getElementById("clear-all-btn");


// Dashboard

const totalTasks =
    document.getElementById("total-tasks");

const completedTasks =
    document.getElementById("completed-tasks");

const pendingTasks =
    document.getElementById("pending-tasks");

const overdueTasks =
    document.getElementById("overdue-tasks");

const progressPercent =
    document.getElementById("progress-percent");

const progressFill =
    document.getElementById("progress-fill");


// Edit modal

const editModal =
    document.getElementById("edit-modal");

const closeModalBtn =
    document.getElementById("close-modal-btn");

const cancelEditBtn =
    document.getElementById("cancel-edit-btn");

const saveEditBtn =
    document.getElementById("save-edit-btn");

const editTaskInput =
    document.getElementById("edit-task-input");

const editAreaInput =
    document.getElementById("edit-area-input");

const editPriorityInput =
    document.getElementById("edit-priority-input");

const editDeadlineInput =
    document.getElementById("edit-deadline-input");


// Theme

const themeBtn =
    document.getElementById("theme-btn");


// PWA Install

const installBtn =
    document.getElementById("install-btn");


// ===============================
// TASK DATA
// ===============================

let tasks =
    JSON.parse(
        localStorage.getItem("vtaskbase_tasks")
    ) || [];

let editingTaskId = null;


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
// TODAY'S DATE
// ===============================

function getToday() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ===============================
// DEADLINE STATUS
// ===============================

function getDeadlineStatus(task) {

    if (!task.deadline) {
        return "";
    }

    if (task.completed) {
        return "Completed";
    }

    const today =
        getToday();

    if (task.deadline < today) {
        return "Overdue";
    }

    if (task.deadline === today) {
        return "Due today";
    }

    return task.deadline;

}


// ===============================
// GET VISIBLE TASKS
// ===============================

function getVisibleTasks() {

    let visibleTasks =
        [...tasks];


    // Search

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    if (search) {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return task.title
                        .toLowerCase()
                        .includes(search);

                }
            );

    }


    // Area filter

    if (areaFilter.value !== "All") {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return task.area ===
                        areaFilter.value;

                }
            );

    }


    // Priority filter

    if (priorityFilter.value !== "All") {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return task.priority ===
                        priorityFilter.value;

                }
            );

    }


    // Sorting

    if (sortSelect.value === "newest") {

        visibleTasks.sort(
            function (a, b) {

                return b.createdAt -
                    a.createdAt;

            }
        );

    }


    if (sortSelect.value === "oldest") {

        visibleTasks.sort(
            function (a, b) {

                return a.createdAt -
                    b.createdAt;

            }
        );

    }


    if (sortSelect.value === "deadline") {

        visibleTasks.sort(
            function (a, b) {

                if (!a.deadline) {
                    return 1;
                }

                if (!b.deadline) {
                    return -1;
                }

                return a.deadline.localeCompare(
                    b.deadline
                );

            }
        );

    }


    if (sortSelect.value === "priority") {

        const priorityOrder = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        visibleTasks.sort(
            function (a, b) {

                return priorityOrder[a.priority] -
                    priorityOrder[b.priority];

            }
        );

    }


    return visibleTasks;

}


// ===============================
// RENDER TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";

    const visibleTasks =
        getVisibleTasks();


    // Empty state

    if (visibleTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    visibleTasks.forEach(
        function (task) {

            const taskItem =
                document.createElement("div");

            taskItem.className =
                "task-item";


            if (task.completed) {

                taskItem.classList.add(
                    "completed"
                );

            }


            const deadlineStatus =
                getDeadlineStatus(task);


            taskItem.innerHTML = `

                <div class="task-check">

                    <input
                        type="checkbox"
                        ${task.completed ? "checked" : ""}
                        data-id="${task.id}"
                    >

                </div>


                <div class="task-info">

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                    <div class="task-meta">

                        <span>
                            ${escapeHTML(task.area)}
                        </span>

                        <span>
                            ${escapeHTML(task.priority)}
                        </span>

                        ${
                            deadlineStatus
                                ? `<span>${escapeHTML(deadlineStatus)}</span>`
                                : ""
                        }

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="edit-task"
                        data-id="${task.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-task"
                        data-id="${task.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            taskList.appendChild(
                taskItem
            );

        }
    );


    // Checkbox events

    const checkboxes =
        taskList.querySelectorAll(
            'input[type="checkbox"]'
        );

    checkboxes.forEach(
        function (checkbox) {

            checkbox.addEventListener(
                "change",
                function () {

                    const id =
                        Number(
                            checkbox.dataset.id
                        );

                    toggleTask(id);

                }
            );

        }
    );


    // Edit buttons

    const editButtons =
        taskList.querySelectorAll(
            ".edit-task"
        );

    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    openEditModal(id);

                }
            );

        }
    );


    // Delete buttons

    const deleteButtons =
        taskList.querySelectorAll(
            ".delete-task"
        );

    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    deleteTask(id);

                }
            );

        }
    );


    updateDashboard();

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
// ADD TASK
// ===============================

function addTask() {

    const title =
        taskInput.value.trim();

    const area =
        areaInput.value;

    const priority =
        priorityInput.value;

    const deadline =
        deadlineInput.value;


    if (!title) {

        alert(
            "Please enter a task."
        );

        taskInput.focus();

        return;

    }


    const newTask = {

        id: Date.now(),

        title: title,

        area: area,

        priority: priority,

        deadline: deadline,

        completed: false,

        createdAt: Date.now()

    };


    tasks.push(
        newTask
    );


    saveTasks();


    // Clear form

    taskInput.value = "";

    deadlineInput.value = "";

    priorityInput.value =
        "Medium";

    areaInput.value =
        "Personal";


    renderTasks();

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

    const shouldDelete =
        confirm(
            "Delete this task?"
        );


    if (!shouldDelete) {
        return;
    }


    tasks =
        tasks.filter(
            function (task) {

                return task.id !== id;

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
        total - completed;


    const today =
        getToday();


    const overdue =
        tasks.filter(
            function (task) {

                return (
                    !task.completed &&
                    task.deadline &&
                    task.deadline < today
                );

            }
        ).length;


    totalTasks.textContent =
        total;

    completedTasks.textContent =
        completed;

    pendingTasks.textContent =
        pending;

    overdueTasks.textContent =
        overdue;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    progressPercent.textContent =
        `${progress}%`;

    progressFill.style.width =
        `${progress}%`;

}


// ===============================
// OPEN EDIT MODAL
// ===============================

function openEditModal(id) {

    const task =
        tasks.find(
            function (task) {

                return task.id === id;

            }
        );


    if (!task) {
        return;
    }


    editingTaskId =
        id;


    editTaskInput.value =
        task.title;

    editAreaInput.value =
        task.area;

    editPriorityInput.value =
        task.priority;

    editDeadlineInput.value =
        task.deadline;


    editModal.classList.add(
        "active"
    );

}


// ===============================
// CLOSE EDIT MODAL
// ===============================

function closeEditModal() {

    editModal.classList.remove(
        "active"
    );

    editingTaskId =
        null;

}


// ===============================
// SAVE EDIT
// ===============================

function saveEdit() {

    if (editingTaskId === null) {
        return;
    }


    const title =
        editTaskInput.value.trim();


    if (!title) {

        alert(
            "Please enter a task."
        );

        editTaskInput.focus();

        return;

    }


    tasks =
        tasks.map(
            function (task) {

                if (
                    task.id ===
                    editingTaskId
                ) {

                    return {

                        ...task,

                        title: title,

                        area:
                            editAreaInput.value,

                        priority:
                            editPriorityInput.value,

                        deadline:
                            editDeadlineInput.value

                    };

                }

                return task;

            }
        );


    saveTasks();

    closeEditModal();

    renderTasks();

}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    function () {

        renderTasks();

    }
);


// ===============================
// FILTERS
// ===============================

areaFilter.addEventListener(
    "change",
    function () {

        renderTasks();

    }
);


priorityFilter.addEventListener(
    "change",
    function () {

        renderTasks();

    }
);


sortSelect.addEventListener(
    "change",
    function () {

        renderTasks();

    }
);


// ===============================
// ADD BUTTON
// ===============================

addTaskBtn.addEventListener(
    "click",
    addTask
);


// ===============================
// ENTER KEY
// ===============================

taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


// ===============================
// CLEAR ALL
// ===============================

clearAllBtn.addEventListener(
    "click",
    function () {

        if (tasks.length === 0) {

            return;

        }


        const shouldClear =
            confirm(
                "Are you sure you want to delete all tasks?"
            );


        if (!shouldClear) {
            return;
        }


        tasks = [];

        saveTasks();

        renderTasks();

    }
);


// ===============================
// EDIT MODAL BUTTONS
// ===============================

closeModalBtn.addEventListener(
    "click",
    closeEditModal
);


cancelEditBtn.addEventListener(
    "click",
    closeEditModal
);


saveEditBtn.addEventListener(
    "click",
    saveEdit
);


// Close modal when clicking outside

editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


// ===============================
// THEME
// ===============================

const savedTheme =
    localStorage.getItem(
        "vtaskbase_theme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );

    themeBtn.textContent =
        "🌙";

} else {

    themeBtn.textContent =
        "☀";

}


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


        if (isLight) {

            themeBtn.textContent =
                "🌙";

            localStorage.setItem(
                "vtaskbase_theme",
                "light"
            );

        } else {

            themeBtn.textContent =
                "☀";

            localStorage.setItem(
                "vtaskbase_theme",
                "dark"
            );

        }

    }
);


// ===============================
// PWA INSTALL
// ===============================

let deferredPrompt =
    null;


// Hide install button at first

if (installBtn) {

    installBtn.style.display =
        "none";

}


// Browser tells us that VTASKBASE
// can be installed

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


// User clicks INSTALL

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (!deferredPrompt) {

                alert(
                    "VTASKBASE cannot be installed right now. Please open the website in Chrome and try again."
                );

                return;

            }


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

        }
    );

}


// App installed

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

