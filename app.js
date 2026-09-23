// ===============================
// GET HTML ELEMENTS
// ===============================

const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const categoryInput = document.getElementById("category-input");
const deadlineInput = document.getElementById("deadline-input");

const addBtn = document.getElementById("add-btn");
const clearBtn = document.getElementById("clear-btn");

const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");

const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");


// ===============================
// LOAD TASKS FROM LOCAL STORAGE
// ===============================

let tasks = JSON.parse(localStorage.getItem("vtaskbase_tasks")) || [];


// ===============================
// SAVE TASKS
// ===============================

function saveTasks() {
    localStorage.setItem("vtaskbase_tasks", JSON.stringify(tasks));
}


// ===============================
// DISPLAY TASKS
// ===============================

function renderTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }


    tasks.forEach(function(task) {

        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }


        // Task information

        const taskInfo = document.createElement("div");

        taskInfo.className = "task-info";


        // Task name

        const taskName = document.createElement("div");

        taskName.className = "task-name";

        taskName.textContent = task.name;


        // Details

        const taskDetails = document.createElement("div");

        taskDetails.className = "task-details";


        // Priority badge

        const priorityBadge = document.createElement("span");

        priorityBadge.className = "badge " + task.priority.toLowerCase();

        priorityBadge.textContent = task.priority + " Priority";


        // Category badge

        const categoryBadge = document.createElement("span");

        categoryBadge.className = "badge";

        categoryBadge.textContent = task.category || "General";


        // Deadline badge

        const deadlineBadge = document.createElement("span");

        deadlineBadge.className = "badge";

        deadlineBadge.textContent =
            task.deadline ? "Due: " + task.deadline : "No deadline";


        taskDetails.appendChild(priorityBadge);
        taskDetails.appendChild(categoryBadge);
        taskDetails.appendChild(deadlineBadge);


        taskInfo.appendChild(taskName);
        taskInfo.appendChild(taskDetails);


        // ===============================
        // BUTTONS
        // ===============================

        const actions = document.createElement("div");

        actions.className = "task-actions";


        const completeBtn = document.createElement("button");

        completeBtn.className = "complete-btn";

        completeBtn.textContent =
            task.completed ? "Undo" : "Complete";


        completeBtn.addEventListener("click", function() {

            task.completed = !task.completed;

            saveTasks();

            renderTasks();

        });


        const deleteBtn = document.createElement("button");

        deleteBtn.className = "delete-btn";

        deleteBtn.textContent = "Delete";


        deleteBtn.addEventListener("click", function() {

            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();

            renderTasks();

        });


        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);


        li.appendChild(taskInfo);
        li.appendChild(actions);


        taskList.appendChild(li);

    });


    updateDashboard();
}


// ===============================
// ADD TASK
// ===============================

function addTask() {

    const name = taskInput.value.trim();

    if (name === "") {

        alert("Please enter a task.");

        return;
    }


    const newTask = {

        id: Date.now(),

        name: name,

        priority: priorityInput.value,

        category: categoryInput.value.trim() || "General",

        deadline: deadlineInput.value,

        completed: false

    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();


    // Clear inputs

    taskInput.value = "";

    categoryInput.value = "";

    deadlineInput.value = "";

    priorityInput.value = "Medium";


    taskInput.focus();

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;


    // Calculate percentage

    let progress = 0;

    if (total > 0) {
        progress = Math.round((completed / total) * 100);
    }


    progressText.textContent = progress + "%";

    progressFill.style.width = progress + "%";

}


// ===============================
// CLEAR ALL TASKS
// ===============================

clearBtn.addEventListener("click", function() {

    if (tasks.length === 0) {
        return;
    }


    const confirmDelete = confirm(
        "Are you sure you want to delete all tasks?"
    );


    if (confirmDelete) {

        tasks = [];

        saveTasks();

        renderTasks();

    }

});


// ===============================
// ADD BUTTON
// ===============================

addBtn.addEventListener("click", addTask);


// ===============================
// PRESS ENTER TO ADD TASK
// ===============================

taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// ===============================
// FIRST PAGE LOAD
// ===============================

renderTasks();

