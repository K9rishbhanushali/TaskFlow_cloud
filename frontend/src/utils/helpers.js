// Tiny date/size + validation helpers used by forms across pages.
import { formatDate as fmt, formatSize as fsize } from "./mockData.js";

export { fmt as formatDate, fsize as formatSize };

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export const ALLOWED_STATUSES = ["Pending", "In Progress", "Completed"];
export const ALLOWED_PRIORITIES = ["Low", "Medium", "High"];
