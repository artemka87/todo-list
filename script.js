// Storage key
const STORAGE_KEY = 'todoList';

// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const clearBtn = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');

// App State
let tasks = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearBtn.addEventListener('click', clearCompletedTasks);

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            e.target.closest('.filter-btn').classList.add('active');
            currentFilter = e.target.closest('.filter-btn').dataset.filter;
            renderTasks();
        });
    });
}

// Add Task
function addTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        taskInput.focus();
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString('ru-RU'),
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle Task Completion
function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Clear Completed Tasks
function clearCompletedTasks() {
    if (confirm('Удалить все выполненные задачи?')) {
        tasks = tasks.filter((task) => !task.completed);
        saveTasks();
        renderTasks();
    }
}

// Filter Tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter((task) => !task.completed);
        case 'completed':
            return tasks.filter((task) => task.completed);
        default:
            return tasks;
    }
}

// Render Tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    // Clear task list
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input
                    type="checkbox"
                    class="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            taskList.appendChild(li);
        });
    }

    updateStats();
    updateClearButton();
}

// Update Statistics
function updateStats() {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;

    completedCount.textContent = completed;
    totalCount.textContent = total;
}

// Update Clear Button State
function updateClearButton() {
    const hasCompleted = tasks.some((task) => task.completed);
    clearBtn.disabled = !hasCompleted;
}

// Save Tasks to localStorage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Load Tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch (e) {
            console.error('Ошибка при загрузке задач:', e);
            tasks = [];
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
