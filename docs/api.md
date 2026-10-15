# REST API documentation

Base URL (dev): `http://127.0.0.1:5000/api`. All private endpoints need
`Authorization: Bearer <JWT>`. Errors are JSON: `{"error": "..."}` (and
`{"error": "...", "fields": {...}}` for validation failures).

## System

- `GET /api/health` → `{"status":"ok","service":"taskflow-backend","phase":9,"db":"up|down"}`
- `GET /` → welcome message

## Auth

| Method & path | Body | Success | Errors |
|---|---|---|---|
| `POST /api/auth/register` | `{name, email, password≥6}` | `201 {user, access_token}` | `400` validation, `409` duplicate email |
| `POST /api/auth/login` | `{email, password}` | `200 {user, access_token}` | `401` invalid credentials |
| `GET /api/auth/me` | — | `200 {user}` | `401` |
| `PATCH /api/auth/me` | `{name}` | `200 {user}` | `400`, `401` |

`user` never contains `password_hash`. Example:

```powershell
# register then list tasks (PowerShell)
$reg = Invoke-RestMethod http://127.0.0.1:5000/api/auth/register `
  -Method Post -ContentType "application/json" `
  -Body '{"name":"Asha","email":"asha@college.edu","password":"secret12"}'
$headers = @{ Authorization = "Bearer $($reg.access_token)" }
Invoke-RestMethod http://127.0.0.1:5000/api/tasks -Headers $headers
```

## Tasks (all `401` without token, `404` for foreign/missing ids)

- `GET /api/tasks?search=&status=&priority=&subject=&sort=due_date|created&page=&per_page=` → `{tasks, total, page, per_page, pages}`
- `POST /api/tasks` `{title≥3, description?, subject?, priority?, status?, due_date?}` → `201 {task}`
- `GET /api/tasks/<id>` → `200 {task}`
- `PUT /api/tasks/<id>` (full body, same rules) → `200 {task}`
- `PATCH /api/tasks/<id>/status` `{status}` → `200 {task}`
- `DELETE /api/tasks/<id>` → `200 {message}` (linked files kept, `task_id` nulled)

Task shape: `{id, title, description, subject, priority, status, due_date,
is_overdue, created_at, updated_at}`.

## Dashboard

- `GET /api/dashboard/stats` → `{total, pending, in_progress, completed,
  overdue, completion, by_status[3], upcoming[≤5], recent[≤5]}`.
  Overdue = incomplete task with `due_date` in the past.

## Study files

- `GET /api/files` → `{files}` (own files, newest first)
- `POST /api/files/upload` (multipart `file` + optional `task_id`) → `201 {file}`
  Allowed: `ALLOWED_EXTENSIONS` (default pdf/txt/docx), max `UPLOAD_MAX_MB`
  (default 5). MIME/extension mismatch → `400`.
- `GET /api/files/<id>/download` → file bytes (local) or `302` to a 15-min
  S3 presigned URL (cloud). Foreign id → `404`; content missing → `410`.
- `DELETE /api/files/<id>` → `200 {message}` (storage object + row removed).
