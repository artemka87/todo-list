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
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const dateDisplay = document.getElementById('date-display');
const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// App State
let tasks = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    loadTasks();
    renderTasks();
    setupEventListeners();
});

// Set current date
function setCurrentDate() {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];

    dateDisplay.textContent = `${dayName}, ${date} ${monthName}`;
}

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
    if (tasks.some((task) => task.completed)) {
        if (confirm('Удалить все выполненные задачи?')) {
            tasks = tasks.filter((task) => !task.completed);
            saveTasks();
            renderTasks();
        }
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
                <button class="delete-btn" onclick="deleteTask(${task.id})" type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            `;

            taskList.appendChild(li);
        });
    }

    updateStats();
    updateClearButton();
    updateProgress();
}

// Update Statistics
function updateStats() {
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.filter((task) => !task.completed).length;
    const total = tasks.length;

    completedCount.textContent = completed;
    totalCount.textContent = total;
    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

// Update Progress Bar
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressFill.style.width = percentage + '%';
    progressPercent.textContent = percentage + '%';
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