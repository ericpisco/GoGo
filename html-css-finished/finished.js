document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
});

function loadTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    // Retrieve tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(function (task, index) {
        addTaskToDOM(task, index);
    });
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        // Retrieve tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        // Add new task to the array
        tasks.push({ text: taskText, completed: false });

        // Save tasks to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Update the DOM
        addTaskToDOM({ text: taskText, completed: false }, tasks.length - 1);

        // Clear the input field
        taskInput.value = "";
    }
}

function addTaskToDOM(task, index) {
    const taskList = document.getElementById("taskList");

    const li = document.createElement("li");
    li.innerHTML = `
        <span>${task.text}</span>
        <button onclick="completeTask(${index})">Complete</button>
        <button onclick="deleteTask(${index})">Delete</button>
    `;

    // Apply styles based on completion status
    if (task.completed) {
        li.style.textDecoration = "line-through";
        li.style.color = "#777";
    }

    taskList.appendChild(li);
}

function completeTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[index].completed = !tasks[index].completed;

    // Save tasks to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Reload tasks in the DOM
    loadTasks();
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);

    // Save tasks to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Reload tasks in the DOM
    loadTasks();
}
