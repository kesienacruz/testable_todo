const elements = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  title: document.querySelector('[data-testid="test-todo-title"]'),
  description: document.querySelector('[data-testid="test-todo-description"]'),
  priority: document.querySelector('[data-testid="test-todo-priority"]'),
  priorityIndicator: document.querySelector('[data-testid="test-todo-priority-indicator"]'),
  dueDate: document.querySelector('[data-testid="test-todo-due-date"]'),
  timeRemaining: document.querySelector('[data-testid="test-todo-time-remaining"]'),
  overdueIndicator: document.querySelector('[data-testid="test-todo-overdue-indicator"]'),
  status: document.querySelector('[data-testid="test-todo-status"]'),
  statusControl: document.querySelector('[data-testid="test-todo-status-control"]'),
  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]'),
  collapsible: document.querySelector('[data-testid="test-todo-collapsible-section"]'),
  expandToggle: document.querySelector('[data-testid="test-todo-expand-toggle"]'),
  editButton: document.querySelector('[data-testid="test-todo-edit-button"]'),
  deleteButton: document.querySelector('[data-testid="test-todo-delete-button"]'),
  editForm: document.querySelector('[data-testid="test-todo-edit-form"]'),
  editTitleInput: document.querySelector('[data-testid="test-todo-edit-title-input"]'),
  editDescriptionInput: document.querySelector('[data-testid="test-todo-edit-description-input"]'),
  editPrioritySelect: document.querySelector('[data-testid="test-todo-edit-priority-select"]'),
  editDueDateInput: document.querySelector('[data-testid="test-todo-edit-due-date-input"]'),
  saveButton: document.querySelector('[data-testid="test-todo-save-button"]'),
  cancelButton: document.querySelector('[data-testid="test-todo-cancel-button"]'),
};

let state = {
  title: "Finish UI Task With Interactive State Handling",
  description:
    "Complete the Stage 1a todo card by adding edit mode, synchronized status controls, granular time updates, overdue handling, and an accessible expand/collapse pattern. The layout must stay clean and responsive across mobile, tablet, and desktop sizes, while remaining fully keyboard accessible and easy to test with exact data-testid values. The card should behave like a polished, stateful UI component rather than a static mockup.",
  priority: "High",
  status: "In Progress",
  dueDate: "2026-12-01T18:00:00.000Z",
  isExpanded: false,
  isEditing: false,
};

let draftState = null;
let timeIntervalId = null;
const COLLAPSE_THRESHOLD = 160;

function pluralize(value, unit) {
  return value === 1 ? unit : `${unit}s`;
}

function formatDisplayDate(isoValue) {
  const date = new Date(isoValue);
  return `Due ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function toLocalInputValue(isoValue) {
  const date = new Date(isoValue);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function localInputToIso(value) {
  return new Date(value).toISOString();
}

function getFriendlyRemainingText(targetDate, status) {
  if (status === "Done") return "Completed";

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < minute) {
    return diffMs >= 0 ? "Due now!" : "Overdue by less than a minute";
  }

  if (diffMs > 0) {
    const days = Math.floor(diffMs / day);
    const hours = Math.floor(diffMs / hour);
    const minutes = Math.floor(diffMs / minute);

    if (days > 1) return `Due in ${days} ${pluralize(days, "day")}`;
    if (days === 1) return "Due tomorrow";
    if (hours >= 1) return `Due in ${hours} ${pluralize(hours, "hour")}`;
    return `Due in ${minutes} ${pluralize(minutes, "minute")}`;
  }

  const overdueDays = Math.floor(absMs / day);
  const overdueHours = Math.floor(absMs / hour);
  const overdueMinutes = Math.floor(absMs / minute);

  if (overdueDays >= 1) return `Overdue by ${overdueDays} ${pluralize(overdueDays, "day")}`;
  if (overdueHours >= 1) return `Overdue by ${overdueHours} ${pluralize(overdueHours, "hour")}`;
  return `Overdue by ${overdueMinutes} ${pluralize(overdueMinutes, "minute")}`;
}

function applyPriorityClasses(priority) {
  const normalized = priority.toLowerCase();
  elements.card.classList.remove("priority-low", "priority-medium", "priority-high");
  elements.priority.classList.remove("priority-low", "priority-medium", "priority-high");
  elements.card.classList.add(`priority-${normalized}`);
  elements.priority.classList.add(`priority-${normalized}`);
}

function applyStatusPresentation(status) {
  elements.status.textContent = status;
  elements.status.className = "status-badge";

  if (status === "Done") {
    elements.status.classList.add("status-done");
    elements.status.setAttribute("aria-label", "Status Done");
    elements.card.classList.add("is-done");
  } else if (status === "Pending") {
    elements.status.classList.add("status-pending");
    elements.status.setAttribute("aria-label", "Status Pending");
    elements.card.classList.remove("is-done");
  } else {
    elements.status.classList.add("status-in-progress");
    elements.status.setAttribute("aria-label", "Status In Progress");
    elements.card.classList.remove("is-done");
  }
}

function syncStatusControls() {
  elements.statusControl.value = state.status;
  elements.checkbox.checked = state.status === "Done";
}

function shouldCollapse(description) {
  return description.trim().length > COLLAPSE_THRESHOLD;
}

function applyCollapseState() {
  const collapsibleNeeded = shouldCollapse(state.description);

  if (!collapsibleNeeded) {
    elements.collapsible.classList.remove("is-collapsed");
    elements.collapsible.classList.add("is-expanded");
    elements.expandToggle.hidden = true;
    elements.expandToggle.setAttribute("aria-expanded", "true");
    return;
  }

  elements.expandToggle.hidden = false;

  if (state.isExpanded) {
    elements.collapsible.classList.remove("is-collapsed");
    elements.collapsible.classList.add("is-expanded");
    elements.expandToggle.textContent = "Show less";
    elements.expandToggle.setAttribute("aria-expanded", "true");
  } else {
    elements.collapsible.classList.remove("is-expanded");
    elements.collapsible.classList.add("is-collapsed");
    elements.expandToggle.textContent = "Show more";
    elements.expandToggle.setAttribute("aria-expanded", "false");
  }
}

function updateTimeAndOverdueState() {
  const dueDate = new Date(state.dueDate);
  const remainingText = getFriendlyRemainingText(dueDate, state.status);
  const isOverdue = state.status !== "Done" && dueDate.getTime() < Date.now();

  elements.timeRemaining.textContent = remainingText;
  elements.timeRemaining.setAttribute("datetime", dueDate.toISOString());

  if (isOverdue) {
    elements.card.classList.add("is-overdue");
    elements.overdueIndicator.classList.remove("is-hidden");
  } else {
    elements.card.classList.remove("is-overdue");
    elements.overdueIndicator.classList.add("is-hidden");
  }
}

function restartTimer() {
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }

  updateTimeAndOverdueState();

  if (state.status !== "Done") {
    timeIntervalId = setInterval(updateTimeAndOverdueState, 30000);
  }
}

function renderView() {
  elements.title.textContent = state.title;
  elements.description.textContent = state.description;
  elements.priority.textContent = state.priority;
  elements.priority.setAttribute("aria-label", `Priority ${state.priority}`);
  elements.dueDate.textContent = formatDisplayDate(state.dueDate);
  elements.dueDate.setAttribute("datetime", new Date(state.dueDate).toISOString());

  applyPriorityClasses(state.priority);
  applyStatusPresentation(state.status);
  syncStatusControls();
  applyCollapseState();
  restartTimer();
}

function fillEditForm() {
  elements.editTitleInput.value = state.title;
  elements.editDescriptionInput.value = state.description;
  elements.editPrioritySelect.value = state.priority;
  elements.editDueDateInput.value = toLocalInputValue(state.dueDate);
}

function openEditMode() {
  draftState = { ...state };
  state.isEditing = true;
  fillEditForm();
  elements.editForm.classList.remove("hidden");
  elements.editTitleInput.focus();
}

function closeEditMode() {
  state.isEditing = false;
  elements.editForm.classList.add("hidden");
  elements.editButton.focus();
}

function saveEditMode() {
  state.title = elements.editTitleInput.value.trim() || state.title;
  state.description = elements.editDescriptionInput.value.trim() || state.description;
  state.priority = elements.editPrioritySelect.value;
  if (elements.editDueDateInput.value) {
    state.dueDate = localInputToIso(elements.editDueDateInput.value);
  }
  if (!shouldCollapse(state.description)) {
    state.isExpanded = true;
  }
  renderView();
  closeEditMode();
}

function cancelEditMode() {
  if (draftState) {
    state = { ...state, ...draftState };
  }
  renderView();
  closeEditMode();
}

elements.checkbox.addEventListener("change", () => {
  if (elements.checkbox.checked) {
    state.status = "Done";
  } else {
    state.status = "Pending";
  }
  renderView();
});

elements.statusControl.addEventListener("change", (event) => {
  state.status = event.target.value;
  renderView();
});

elements.expandToggle.addEventListener("click", () => {
  state.isExpanded = !state.isExpanded;
  applyCollapseState();
});

elements.editButton.addEventListener("click", () => {
  openEditMode();
});

elements.deleteButton.addEventListener("click", () => {
  alert("Delete clicked");
});

elements.saveButton.addEventListener("click", () => {
  saveEditMode();
});

elements.cancelButton.addEventListener("click", () => {
  cancelEditMode();
});

renderView();
