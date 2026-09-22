// Create an empty array
let tasks = [];


// Get the HTML elements
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");


// Get saved tasks from LocalStorage
const savedTasks = localStorage.getItem("tasks");


// If saved tasks exist
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}


// Function to display tasks
function renderTasks() {

    // Clear the list
    taskList.innerHTML = "";


    // Go through every task
    tasks.forEach(function(task) {

        // Create an li
        const li = document.createElement("li");


        // Put the task and Delete button inside it
        li.innerHTML = `
            <span>${task}</span>
            <button class="delete-btn">Delete</button>
        `;


        // Add the li to the ul
        taskList.appendChild(li);

    });
}


// Listen for the Add button click
addBtn.addEventListener("click", function(event) {

    // Prevent default behavior
    event.preventDefault();


    // Get what the user typed
    const task = taskInput.value.trim();


    // Don't allow empty tasks
    if (task === "") {
        return;
    }


    // Add the task to the array
    tasks.push(task);


    // Save tasks to LocalStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));


    // Display the tasks
    renderTasks();


    // Clear the input box
    taskInput.value = "";

});


// Listen for clicks on the task list
taskList.addEventListener("click", function(event) {

    // Check if the Delete button was clicked
    if (event.target.classList.contains("delete-btn")) {


        // Get the li
        const li = event.target.parentElement;


        // Get the task text
        const taskToDelete = li.querySelector("span").textContent;


        // Remove the task
        tasks = tasks.filter(function(task) {

            return task !== taskToDelete;

        });


        // Update LocalStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));


        // Display the updated list
        renderTasks();

    }

});


// Display saved tasks when the page loads
renderTasks();