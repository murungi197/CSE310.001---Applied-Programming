/* Smart Study Planner stores the user's plan locally and keeps the interface in sync. */
const STORAGE_KEY = "smart-study-planner-tasks";
const dateFns = window.dateFns;
let tasks = loadTasks();

const elements = {
  form: document.querySelector("#taskForm"),
  title: document.querySelector("#taskTitle"),
  course: document.querySelector("#taskCourse"),
  deadline: document.querySelector("#taskDeadline"),
  priority: document.querySelector("#taskPriority"),
  category: document.querySelector("#taskCategory"),
  message: document.querySelector("#formMessage"),
  list: document.querySelector("#taskList"),
  empty: document.querySelector("#emptyState"),
  search: document.querySelector("#searchInput"),
  courseFilter: document.querySelector("#courseFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  categoryTree: document.querySelector("#categoryTree"),
  toast: document.querySelector("#toast"),
};

// Recover saved work safely so a damaged local-storage value cannot break the app.
function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(storedTasks) ? storedTasks : [];
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Validate the form, create a task object, and redraw the interface after saving.
function addTask(event) {
  event.preventDefault();
  try {
    if (
      !elements.title.value.trim() ||
      !elements.course.value.trim() ||
      !elements.deadline.value
    )
      throw new Error("Add a title, course, and deadline before saving.");
    tasks.unshift({
      id: crypto.randomUUID(),
      title: elements.title.value.trim(),
      course: elements.course.value.trim(),
      deadline: elements.deadline.value,
      priority: elements.priority.value,
      category: elements.category.value,
      completed: false,
    });
    saveTasks();
    elements.form.reset();
    elements.message.textContent = "";
    showToast("Task added to your plan");
    render();
  } catch (error) {
    elements.message.textContent = error.message;
  }
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );
  saveTasks();
  render();
}
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  showToast("Task removed");
  render();
}

function getVisibleTasks() {
  const searchTerm = elements.search.value.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.course}`
      .toLowerCase()
      .includes(searchTerm);
    const matchesCourse =
      elements.courseFilter.value === "all" ||
      task.course === elements.courseFilter.value;
    const matchesStatus =
      elements.statusFilter.value === "all" ||
      (elements.statusFilter.value === "completed"
        ? task.completed
        : !task.completed);
    return matchesSearch && matchesCourse && matchesStatus;
  });
}

function formatDeadline(deadline) {
  const date = dateFns.parseISO(`${deadline}T12:00:00`);
  return dateFns.isToday(date)
    ? "Due today"
    : dateFns.format(date, "MMM d, yyyy");
}

function renderTask(task) {
  const item = document.createElement("article");
  item.className = `task-item task-item--${task.priority}${task.completed ? " is-complete" : ""}`;
  item.innerHTML = `<button class="check-button" type="button" aria-label="Mark ${escapeHtml(task.title)} ${task.completed ? "active" : "complete"}">${task.completed ? "✓" : ""}</button><div><div class="task-title">${escapeHtml(task.title)}</div><div class="task-meta">${escapeHtml(task.course)} · ${escapeHtml(task.category)} · ${formatDeadline(task.deadline)}</div></div><span class="priority priority--${task.priority}">${task.priority}</span><button class="delete-button" type="button" aria-label="Delete ${escapeHtml(task.title)}">×</button>`;
  item
    .querySelector(".check-button")
    .addEventListener("click", () => toggleTask(task.id));
  item
    .querySelector(".delete-button")
    .addEventListener("click", () => deleteTask(task.id));
  return item;
}

// Recursion keeps the category renderer independent of the number of categories.
function renderCategoryTree(categoryEntries, index = 0) {
  if (index >= categoryEntries.length) return;
  const [category, categoryTasks] = categoryEntries[index];
  const completed = categoryTasks.filter((task) => task.completed).length;
  const categoryElement = document.createElement("div");
  categoryElement.className = "category-item";
  categoryElement.innerHTML = `<strong>${categoryTasks.length}</strong><span>${escapeHtml(category)}</span><small class="${completed === categoryTasks.length ? "is-done" : ""}">${completed}/${categoryTasks.length} complete</small>`;
  elements.categoryTree.append(categoryElement);
  renderCategoryTree(categoryEntries, index + 1);
}

function updateCourseFilter() {
  const selectedCourse = elements.courseFilter.value;
  const courses = [...new Set(tasks.map((task) => task.course))].sort();
  elements.courseFilter.innerHTML = `<option value="all">All courses</option>${courses.map((course) => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join("")}`;
  elements.courseFilter.value = courses.includes(selectedCourse)
    ? selectedCourse
    : "all";
}

// Recalculate all screen output from the current task state after every change.
function render() {
  const completed = tasks.filter((task) => task.completed).length;
  document.querySelector("#totalTasks").textContent = tasks.length;
  document.querySelector("#completedTasks").textContent = completed;
  document.querySelector("#progressPercent").textContent =
    `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`;
  document.querySelector("#taskCountLabel").textContent =
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  updateCourseFilter();
  const visibleTasks = getVisibleTasks();
  elements.list.replaceChildren(...visibleTasks.map(renderTask));
  elements.empty.hidden = visibleTasks.length > 0;
  elements.categoryTree.replaceChildren();
  renderCategoryTree([
    ...Object.entries(
      tasks.reduce((groups, task) => {
        (groups[task.category] ||= []).push(task);
        return groups;
      }, {}),
    ),
  ]);
}

function escapeHtml(value) {
  const text = document.createElement("span");
  text.textContent = value;
  return text.innerHTML;
}
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
}

elements.form.addEventListener("submit", addTask);
[elements.search, elements.courseFilter, elements.statusFilter].forEach(
  (control) => control.addEventListener("input", render),
);
document.querySelector("#todayDate").textContent = dateFns.format(
  new Date(),
  "MMM d, yyyy",
);
document.querySelector("#taskDeadline").min = dateFns.format(
  new Date(),
  "yyyy-MM-dd",
);
render();
