export const ROLES = {
  Admin: "Admin",
  Director: "Director",
  Manager: "Manager",
  Employee: "Employee",
};

export const ROLE_LIST = [ROLES.Admin, ROLES.Director, ROLES.Manager, ROLES.Employee];

// where each role lands after login
export const ROLE_HOME = {
  Admin: "/admin",
  Director: "/director",
  Manager: "/manager",
  Employee: "/employee",
};

export const ENTRY_STATUS = {
  PendingManager: { label: "Pending manager", color: "warning" },
  PendingDirector: { label: "Pending director", color: "info" },
  Approved: { label: "Approved", color: "success" },
  Rejected: { label: "Rejected", color: "error" },
  Cancelled: { label: "Cancelled", color: "default" },
};

export const PROJECT_STATUS = {
  Active: { label: "Active", color: "success" },
  OnHold: { label: "On hold", color: "warning" },
  Completed: { label: "Completed", color: "info" },
  Archived: { label: "Archived", color: "default" },
};

export const BUDGET_STATUS = {
  OnTrack: { label: "On track", color: "success" },
  NearLimit: { label: "Near limit", color: "warning" },
  Exceeded: { label: "Exceeded", color: "error" },
};

export const REVIEW_DECISION = {
  Approved: { label: "Approved", color: "success" },
  Rejected: { label: "Rejected", color: "error" },
  Reopened: { label: "Reopened", color: "warning" },
};

export const GROUP_BY = [
  { value: "Day", label: "Day" },
  { value: "Week", label: "Week" },
  { value: "Month", label: "Month" },
];

export const DEFAULT_PAGE_SIZE = 10;

// dashboards and queues are polled (the API has no push channel)
export const POLL_INTERVAL = 30_000;
