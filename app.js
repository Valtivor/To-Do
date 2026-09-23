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

const searchInput =
    document.getElementById("search-input");

const areaFilter =
    document.getElementById("area-filter");

const priorityFilter =
    document.getElementById("priority-filter");

const sortSelect =
    document.getElementById("sort-select");

const clearBtn =
    document.getElementById("clear-btn");

const themeBtn =
    document.getElementById("theme-btn");

const installBtn =
    document.getElementById("install-btn");


// ===============================
// TASK DATA
// ===============================

let tasks =
    JSON.parse(
        localStorage.getItem(
            "vtaskbase_tasks"
        )
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
// GET TODAY'S DATE
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
// CHECK DEADLINE STATUS
// ===============================

function getDeadlineStatus(task) {

    if (!task.deadline) {

        return "";

    }

    if (task.completed) {

        return "completed";

    }

    const today =
        getToday();

    if (task.deadline < today) {

        return "overdue";

    }

    if (task.deadline === today) {

        return "today";

    }

    return "upcoming";

}


// ===============================
// GET VISIBLE TASKS
// ===============================

function getVisibleTasks() {

    let visibleTasks =
        [...tasks];

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const selectedArea =
        areaFilter
            ? areaFilter.value
            : "all";

    const selectedPriority =
        priorityFilter
            ? priorityFilter.value
            : "all";


    // SEARCH

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


    // AREA FILTER

    if (
        selectedArea &&
        selectedArea !== "all"
    ) {

        visibleTasks =
            visibleTasks.filter(
                function (task) {

                    return (
                        task.area ===
                        selectedArea
                    );

                }
            );

    }


    // PRIORITY FILTER

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


    // SORT

    if (sortSelect) {

        const sort =
            sortSelect.value;

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

        if (sort === "deadline") {

            visibleTasks.sort(
                function (a, b) {

                    if (!a.deadline) {
                        return 1;
                    }

                    if (!b.deadline) {
                        return -1;
                    }

                    return (
                        a.deadline.localeCompare(
                            b.deadline
                        )
                    );

                }
            );

        }

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
// RENDER TASKS
// ===============================

function renderTasks() {

    if (!taskList) {
        return;
    }

    const visibleTasks =
        getVisibleTasks();


    taskList.innerHTML = "";


    if (visibleTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>
                    Add a task or change your filters.
                </p>
            </div>
        `;

        updateDashboard();

        return;

    }


    visibleTasks.forEach(
        function (task) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "task-card";


            if (task.completed) {

                card.classList.add(
                    "completed"
                );

            }


            const deadlineStatus =
                getDeadlineStatus(task);


            card.innerHTML = `

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        data-id="${task.id}"
                        ${task.completed ? "checked" : ""}
                    >

                    <div class="task-info">

                        <h3>
                            ${escapeHTML(task.title)}
                        </h3>

                        <div class="task-meta">

                            <span>
                                ${escapeHTML(task.area)}
                            </span>

                            <span class="priority-${task.priority}">
                                ${task.priority}
                            </span>

                            ${
                                task.deadline
                                    ? `
                                    <span
                                        class="deadline ${deadlineStatus}"
                                    >
                                        ${task.deadline}
                                    </span>
                                    `
                                    : ""
                            }

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


            taskList.appendChild(
                card
            );

        }
    );


    // CHECKBOXES

    document
        .querySelectorAll(
            ".task-checkbox"
        )
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


    // EDIT BUTTONS

    document
        .querySelectorAll(
            ".edit-btn"
        )
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


    // DELETE BUTTONS

    document
        .querySelectorAll(
            ".delete-btn"
        )
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
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


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


    if (!title) {

        alert(
            "Please enter a task."
        );

        return;

    }


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

                if (
                    task.id === id
                ) {

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
        tasks.filter(
            function (task) {

                return !task.completed;

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                return (
                    !task.completed &&
                    task.deadline &&
                    task.deadline < getToday()
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


    // PROGRESS

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
// EDIT MODAL
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
            task.deadline;

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


    tasks =
        tasks.map(
            function (task) {

                if (
                    task.id === id
                ) {

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
                            editDeadline
                                ? editDeadline.value
                                : task.deadline

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
// EVENT LISTENERS
// ===============================

if (addTaskBtn) {

    addTaskBtn.addEventListener(
        "click",
        addTask
    );

}


if (taskInput) {

    taskInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                addTask();

            }

        }
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


if (areaFilter) {

    areaFilter.addEventListener(
        "change",
        renderTasks
    );

}


if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        renderTasks
    );

}


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
        savedTheme ===
        "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );


        if (themeBtn) {

            themeBtn.textContent =
                "🌙";

        }

    } else {

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
// EDIT MODAL EVENTS
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

let deferredPrompt =
    null;


// SHOW THE INSTALL BUTTON
// ALWAYS

if (installBtn) {

    installBtn.style.display =
        "block";

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


// USER CLICKS INSTALL

if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            // If the browser has provided
            // an installation prompt

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


            // If the browser has NOT provided
            // the installation prompt

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