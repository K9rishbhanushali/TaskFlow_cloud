// TEMPORARY mock data for Phase 2 UI prototype only.
// Phase 5 will replace all of this with real backend API calls.
// Every function here is labeled MOCK so evaluators see the boundary.

export const MOCK_USER = {
  id: 1,
  name: "Demo Student",
  email: "demo@college.edu",
};

export const MOCK_TASKS = [
  {
    id: 1,
    title: "DBMS Assignment 4 — Normalization",
    description: "Solve 1NF–3NF problems from chapter 7 and upload PDF.",
    subject: "DBMS",
    priority: "High",
    status: "Pending",
    due_date: daysFromNow(1),
    created_at: daysFromNow(-6),
  },
  {
    id: 2,
    title: "Cloud Lab — Static website deployment",
    description: "Document the deployment endpoint and required configuration.",
    subject: "Cloud Computing",
    priority: "Medium",
    status: "In Progress",
    due_date: daysFromNow(3),
    created_at: daysFromNow(-4),
  },
  {
    id: 3,
    title: "Maths revision — Laplace transforms",
    description: "Practice 20 problems, focus on inverse transforms.",
    subject: "Maths",
    priority: "Medium",
    status: "Completed",
    due_date: daysFromNow(-2),
    created_at: daysFromNow(-10),
  },
  {
    id: 4,
    title: "OS report — paging vs segmentation",
    description: "2-page comparison with diagrams.",
    subject: "Operating Systems",
    priority: "Low",
    status: "Pending",
    due_date: daysFromNow(-1),
    created_at: daysFromNow(-5),
  },
  {
    id: 5,
    title: "CN midterm prep — TCP vs UDP",
    description: "Flashcards + previous year questions.",
    subject: "Networks",
    priority: "High",
    status: "In Progress",
    due_date: daysFromNow(6),
    created_at: daysFromNow(-2),
  },
  {
    id: 6,
    title: "Project synopsis draft",
    description: "Problem statement, objectives, and module breakup.",
    subject: "Project",
    priority: "High",
    status: "Pending",
    due_date: daysFromNow(9),
    created_at: daysFromNow(-1),
  },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// --- helpers shared by Dashboard + Tasks pages ---

export function isOverdue(task) {
  // Same rule the backend will use in Phase 6:
  // incomplete task whose due date has passed.
  if (!task.due_date) return false;
  if (task.status === "Completed") return false;
  return new Date(task.due_date) < new Date();
}

export function calcStats(tasks) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter(isOverdue).length;
  const completion = total === 0 ? 0 : Math.round((completed / total) * 100);
  const byStatus = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];
  const upcoming = [...tasks]
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);
  const recent = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
    completion,
    byStatus,
    upcoming,
    recent,
  };
}

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export const SUBJECTS = [
  "DBMS",
  "Cloud Computing",
  "Maths",
  "Operating Systems",
  "Networks",
  "Project",
];
