# TaskFlow Cloud — college submission document

## Abstract

TaskFlow Cloud is a cloud-ready student productivity web application. A
React dashboard lets students register, log in, manage study tasks with
deadlines and priorities, track completion statistics with charts, and
upload/download study documents. A Flask REST API with JWT authentication
serves the data from a relational database (SQLite locally, PostgreSQL on
AWS RDS), storing study-file bytes on the application host's local disk.

## Problem statement

Students juggle assignments across subjects with different deadlines and
priorities, often tracked in scattered notebooks or chats. Missed deadlines
and lost study material hurt grades. A single, secure, accessible dashboard
for tasks, deadlines, progress, and documents solves this.

## Objectives

1. Secure per-student accounts (hashed passwords, JWT sessions).
2. Full task lifecycle: create, edit, status changes, delete (with confirm).
3. Search, filter, and sort tasks; highlight overdue items.
4. Dashboard analytics computed from the user's own data (no hardcoded stats).
5. Study-file upload/download/delete with type and size validation.
6. Automated tests, clean architecture docs, and an AWS deployment path.

## Proposed solution

A three-tier system: React SPA (Amplify) → Flask API (EC2) → RDS, with
application-host local storage for uploaded study files.
Local development uses the same code with SQLite + local disk, so the
evaluator can run everything without AWS.

## Functional requirements

- Register/login/logout; view/update profile.
- Task CRUD; status transitions; search by title; filter by status/priority/
  subject; sort by deadline/creation; pagination on the API.
- Dashboard: totals, pending/in-progress/completed/overdue, completion %,
  upcoming deadlines, recent tasks, status charts.
- Files: upload (pdf/txt/docx, 5 MB), list with size/date, download owned
  files only, delete files.
- Consistent JSON errors; loading/empty/error states; delete confirmations.

## Non-functional requirements

- Responsive (desktop/tablet/mobile), accessible labels, keyboard navigation.
- JWT expiry; bcrypt passwords; ownership checks on every private endpoint.
- Same models on SQLite and PostgreSQL; migrations (no `create_all` in prod).
- HTTPS and least-privilege security groups for the production API and database.

## AWS services used

Amplify (frontend hosting), EC2 (Flask + Gunicorn + Nginx), and RDS PostgreSQL
(users, tasks and file metadata). Study-file bytes remain on the EC2 host.
See `architecture.md`.

## Database schema

- `users(id, name, email UNIQUE, password_hash, created_at, updated_at)`
  has-many tasks and files (cascade on user delete).
- `tasks(id, user_id→users, title, description, subject, priority
  ∈ {Low,Medium,High}, status ∈ {Pending,In Progress,Completed},
  due_date, created_at, updated_at)`; indexes on (user,status),
  (user,due_date).
- `study_files(id, user_id→users, task_id→tasks NULLABLE SET NULL,
  original_filename, storage_key UNIQUE, content_type, file_size,
  uploaded_at)`; deleting a task keeps its files with `task_id=NULL`.

## Test cases and results

Backend `pytest`: **11 passed** — registration, duplicate email, invalid
credentials, auth guard on private routes, task create/edit/status/delete,
task ownership isolation (404, no existence leak), invalid task input,
dashboard stats correctness, file type/size rejection, file ownership,
download/delete flow, JSON error shapes. Frontend `npm run build` passes.
Manual end-to-end script: register → create tasks → stats update → upload →
download → delete (see README).

## Limitations (honest)

- JWTs live in localStorage (simple, documented); HttpOnly cookies would be
  stronger against XSS.
- No password reset/email verification, no pagination UI (API supports it),
  single 5 MB limit for all file types.
- AWS deployment is configured and documented but not executed here — no live
  deployment is claimed.

## Future enhancements

Password reset, task sharing/reminders, full-text subject management,
file previews, pagination UI, refresh-token rotation, HttpOnly-cookie auth,
CI pipeline, CloudFront + ALB, RDS backups/alarms and a future managed-file-storage review.

## Conclusion

TaskFlow Cloud meets its objectives: a secure, tested, full-stack task and
study manager that runs locally today and deploys to the four required AWS
services with only configuration changes.
