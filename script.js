const dueDate = new Date("2026-04-20T18:00:00Z");
const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const title = document.querySelector('[data-testid="test-todo-title"]');
const status = document.querySelector('[data-testid="test-todo-status"]');
const timeRemaining = document.querySelector('[data-testid="test-todo-time-remaining"]');
const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');

function pluralize(value, unit) {
  return value === 1 ? unit : `${unit}s`;
}

function getFriendlyRemainingText(targetDate) {
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

function setStatus(nextStatus) {
  status.textContent = nextStatus;
  status.className = "status-badge";

  if (nextStatus === "Done") {
    status.classList.add("status-done");
    status.setAttribute("aria-label", "Status Done");
  } else if (nextStatus === "Pending") {
    status.classList.add("status-pending");
    status.setAttribute("aria-label", "Status Pending");
  } else {
    status.classList.add("status-in-progress");
    status.setAttribute("aria-label", "Status In Progress");
  }
}

function updateTimeRemaining() {
  timeRemaining.textContent = getFriendlyRemainingText(dueDate);
  timeRemaining.setAttribute("datetime", dueDate.toISOString());
}

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    title.classList.add("is-complete");
    setStatus("Done");
  } else {
    title.classList.remove("is-complete");
    setStatus("In Progress");
  }
});

editButton.addEventListener("click", () => {
  //alert("edit clicked");
  console.log("edit clicked");
});

deleteButton.addEventListener("click", () => {
  alert("Delete clicked");
});

setStatus("In Progress");
updateTimeRemaining();
setInterval(updateTimeRemaining, 30000);
