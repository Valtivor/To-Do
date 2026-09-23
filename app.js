// ===============================
// GET HTML ELEMENTS
// ===============================

const taskInput =
    document.getElementById("task-input");

const categoryInput =
    document.getElementById("category-input");

const priorityInput =
    document.getElementById("priority-input");

const deadlineInput =
    document.getElementById("deadline-input");

const addBtn =
    document.getElementById("add-btn");

const clearBtn =
    document.getElementById("clear-btn");

const taskList =
    document.getElementById("task-list");

const emptyMessage =
    document.getElementById("empty-message");

const searchInput =
    document.getElementById("search-input");

const areaFilter =
    document.getElementById("area-filter");

const priorityFilter =
    document.getElementById("priority-filter");

const sortFilter =
    document.getElementById("sort-filter");

const totalTasks =
    document.getElementById("total-tasks");

const completedTasks =
    document.getElementById("completed-tasks");

const pendingTasks =
    document.getElementById("pending-tasks");

const overdueTasks =
    document.getElementById("overdue-tasks");

const progressText =
    document.getElementById("progress-text");

const progressFill =
    document.getElementById("progress-fill");

const todayCount =
    document.getElementById("today-count");

const focusTitle =
    document.getElementById("focus-title");

const focusText =
    document.getElementById("focus-text");

const themeBtn =
    document.getElementById("theme-btn");

const installBtn =
    document.getElementById("install-btn");


// ===============================
// EDIT ELEMENTS
// ===============================

const editModal =
    document.getElementById("edit-modal");

const closeModal =
    document.getElementById("close-modal");

const editTaskInput =
    document.getElementById("edit-task-input");

const editCategoryInput =
    document.getElementById("edit-category-input");

const editPriorityInput =
    document.getElementById("edit-priority-input");

const editDeadlineInput =
    document.getElementById("edit-deadline-input");

const saveEditBtn =
    document.getElementById("save-edit-btn");


// ===============================
// LOAD TASKS
// ===============================

let tasks =
    JSON.parse(
        localStorage.getItem("vtaskbase_tasks")
    ) || [];


// This remembers which task is being edited.

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
// GET TODAY'S DATE
// ===============================

function getToday() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ===============================
// CHECK DEADLINE STATUS
// ===============================

function getDeadlineStatus(deadline) {

    if (!deadline) {

        return "No deadline";

    }


    const today =
        getToday();


    if (deadline < today) {

        return "Overdue";

    }


    if (deadline === today) {

        return "Due Today";

    }


    return "Due: " + deadline;

}


// ===============================
// FILTER TASKS
// ===============================

function getVisibleTasks() {

    let visibleTasks =
        [...tasks];


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    if (search !== "") {

        visibleTasks =
            visibleTasks.filter(
                function(task) {

                    return task.name
                        .toLowerCase()
                        .includes(search);

                }
            );

    }


    if (areaFilter.value !== "All") {

        visibleTasks =
            visibleTasks.filter(
                function(task) {

                    return task.category ===
                        areaFilter.value;

                }
            );

    }


    if (priorityFilter.value !== "All") {

        visibleTasks =
            visibleTasks.filter(
                function(task) {

                    return task.priority ===
                        priorityFilter.value;

                }
            );

    }


    const sort =
        sortFilter.value;


    if (sort === "newest") {

        visibleTasks.sort(
            function(a, b) {

                return b.id - a.id;

            }
        );

    }


    if (sort === "oldest") {

        visibleTasks.sort(
            function(a, b) {

                return a.id - b.id;

            }
        );

    }


    if (sort === "deadline") {

        visibleTasks.sort(
            function(a, b) {

                if (!a.deadline) return 1;

                if (!b.deadline) return -1;

                return a.deadline
                    .localeCompare(b.deadline);

            }
        );

    }


    if (sort === "priority") {

        const priorityValue = {

            High: 1,
            Medium: 2,
            Low: 3

        };


        visibleTasks.sort(
            function(a, b) {

                return priorityValue[a.priority] -
                    priorityValue[b.priority];

            }
        );

    }


    if (sort === "completed") {

        visibleTasks.sort(
            function(a, b) {

                return Number(a.completed) -
                    Number(b.completed);

            }
        );

    }


    return visibleTasks;

}


// ===============================
// DISPLAY TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";


    const visibleTasks =
        getVisibleTasks();


    if (visibleTasks.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    visibleTasks.forEach(
        function(task) {

            const li =
                document.createElement("li");

            li.className =
                "task-item";


            if (task.completed) {

                li.classList.add("completed");

            }


            const taskInfo =
                document.createElement("div");

            taskInfo.className =
                "task-info";


            const taskName =
                document.createElement("div");

            taskName.className =
                "task-name";

            taskName.textContent =
                task.name;


            const taskDetails =
                document.createElement("div");

            taskDetails.className =
                "task-details";


            const priorityBadge =
                document.createElement("span");

            priorityBadge.className =
                "badge " +
                task.priority.toLowerCase();

            priorityBadge.textContent =
                task.priority + " Priority";


            const categoryBadge =
                document.createElement("span");

            categoryBadge.className =
                "badge";

            categoryBadge.textContent =
                task.category;


            const deadlineBadge =
                document.createElement("span");

            deadlineBadge.className =
                "badge";


            const deadlineStatus =
                getDeadlineStatus(
                    task.deadline
                );


            deadlineBadge.textContent =
                deadlineStatus;


            if (
                deadlineStatus === "Overdue"
                &&
                !task.completed
            ) {

                deadlineBadge.classList.add(
                    "overdue"
                );

            }


            if (
                deadlineStatus === "Due Today"
                &&
                !task.completed
            ) {

                deadlineBadge.classList.add(
                    "due-today"
                );

            }


            taskDetails.appendChild(
                priorityBadge
            );

            taskDetails.appendChild(
                categoryBadge
            );

            taskDetails.appendChild(
                deadlineBadge
            );


            taskInfo.appendChild(
                taskName
            );

            taskInfo.appendChild(
                taskDetails
            );


            const actions =
                document.createElement("div");

            actions.className =
                "task-actions";


            const completeBtn =
                document.createElement("button");

            completeBtn.className =
                "complete-btn";

            completeBtn.textContent =
                task.completed
                    ? "Undo"
                    : "Complete";


            completeBtn.addEventListener(
                "click",
                function() {

                    task.completed =
                        !task.completed;

                    saveTasks();

                    renderTasks();

                }
            );


            const editBtn =
                document.createElement("button");

            editBtn.className =
                "edit-btn";

            editBtn.textContent =
                "Edit";


            editBtn.addEventListener(
                "click",
                function() {

                    openEditModal(task);

                }
            );


            const deleteBtn =
                document.createElement("button");

            deleteBtn.className =
                "delete-btn";

            deleteBtn.textContent =
                "Delete";


            deleteBtn.addEventListener(
                "click",
                function() {

                    tasks =
                        tasks.filter(
                            function(item) {

                                return item.id !==
                                    task.id;

                            }
                        );


                    saveTasks();

                    renderTasks();

                }
            );


            actions.appendChild(
                completeBtn
            );

            actions.appendChild(
                editBtn
            );

            actions.appendChild(
                deleteBtn
            );


            li.appendChild(
                taskInfo
            );

            li.appendChild(
                actions
            );


            taskList.appendChild(
                li
            );

        }
    );


    updateDashboard();

}


// ===============================
// ADD TASK
// ===============================

function addTask() {

    const name =
        taskInput.value.trim();


    if (name === "") {

        alert(
            "Please enter a task."
        );

        taskInput.focus();

        return;

    }


    const newTask = {

        id: Date.now(),

        name: name,

        category:
            categoryInput.value,

        priority:
            priorityInput.value,

        deadline:
            deadlineInput.value,

        completed: false

    };


    tasks.push(
        newTask
    );


    saveTasks();

    renderTasks();


    taskInput.value = "";

    categoryInput.value =
        "Coding";

    priorityInput.value =
        "Medium";

    deadlineInput.value =
        "";


    taskInput.focus();

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        ).length;


    const pending =
        total - completed;


    const today =
        getToday();


    const overdue =
        tasks.filter(
            function(task) {

                return (
                    !task.completed &&
                    task.deadline &&
                    task.deadline < today
                );

            }
        ).length;


    const dueToday =
        tasks.filter(
            function(task) {

                return (
                    !task.completed &&
                    task.deadline === today
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


    progressText.textContent =
        progress + "%";


    progressFill.style.width =
        progress + "%";


    todayCount.textContent =
        dueToday;


    if (total === 0) {

        focusTitle.textContent =
            "Stay focused.";

        focusText.textContent =
            "Add your first task and start making progress.";

    } else if (dueToday > 0) {

        focusTitle.textContent =
            "You have work waiting.";

        focusText.textContent =
            `${dueToday} task${dueToday === 1 ? "" : "s"} due today.`;

    } else if (pending === 0) {

        focusTitle.textContent =
            "Everything is complete.";

        focusText.textContent =
            "You've finished all your tasks. Great work.";

    } else {

        focusTitle.textContent =
            "Keep moving.";

        focusText.textContent =
            `${pending} task${pending === 1 ? "" : "s"} still remaining.`;

    }

}


// ===============================
// EDIT TASK
// ===============================

function openEditModal(task) {

    editingTaskId =
        task.id;


    editTaskInput.value =
        task.name;

    editCategoryInput.value =
        task.category;

    editPriorityInput.value =
        task.priority;

    editDeadlineInput.value =
        task.deadline;


    editModal.classList.add(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    function() {

        editModal.classList.remove(
            "show"
        );

    }
);


// ===============================
// SAVE EDIT
// ===============================

saveEditBtn.addEventListener(
    "click",
    function() {

        const newName =
            editTaskInput.value.trim();


        if (newName === "") {

            alert(
                "Task name cannot be empty."
            );

            return;

        }


        const task =
            tasks.find(
                function(item) {

                    return item.id ===
                        editingTaskId;

                }
            );


        if (task) {

            task.name =
                newName;

            task.category =
                editCategoryInput.value;

            task.priority =
                editPriorityInput.value;

            task.deadline =
                editDeadlineInput.value;

        }


        saveTasks();

        renderTasks();


        editModal.classList.remove(
            "show"
        );

    }
);


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    renderTasks
);


// ===============================
// FILTERS
// ===============================

areaFilter.addEventListener(
    "change",
    renderTasks
);


priorityFilter.addEventListener(
    "change",
    renderTasks
);


sortFilter.addEventListener(
    "change",
    renderTasks
);


// ===============================
// CLEAR ALL
// ===============================

clearBtn.addEventListener(
    "click",
    function() {

        if (tasks.length === 0) {

            return;

        }


        const confirmDelete =
            confirm(
                "Are you sure you want to delete all tasks?"
            );


        if (confirmDelete) {

            tasks = [];

            saveTasks();

            renderTasks();

        }

    }
);


// ===============================
// ADD BUTTON
// ===============================

addBtn.addEventListener(
    "click",
    addTask
);


// ===============================
// ENTER KEY
// ===============================

taskInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


// ===============================
// DARK / LIGHT MODE
// ===============================

themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "light"
        );


        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            themeBtn.textContent =
                "☾";

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
// LOAD SAVED THEME
// ===============================

const savedTheme =
    localStorage.getItem(
        "vtaskbase_theme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light"
    );

    themeBtn.textContent =
        "☾";

}


// ===============================
// PWA INSTALL
// ===============================

let deferredPrompt = null;


if (installBtn) {

    installBtn.style.display =
        "none";

}


window.addEventListener(
    "beforeinstallprompt",
    function(event) {

        event.preventDefault();

        deferredPrompt =
            event;


        if (installBtn) {

            installBtn.style.display =
                "block";

        }

    }
);


if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function() {

            if (!deferredPrompt) {

                alert(
                    "VTASKBASE cannot be installed right now. Please open it in Chrome and try again."
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


            deferredPrompt = null;

        }
    );

}


window.addEventListener(
    "appinstalled",
    function() {

        if (installBtn) {

            installBtn.style.display =
                "none";

        }

        deferredPrompt = null;

    }
);


// ===============================
// START APPLICATION
// ===============================

renderTasks();