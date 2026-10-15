# System architecture

```text
Student browser (HTTPS)
        |
        v
AWS Amplify — React + Vite SPA (Tailwind, Router, Axios, Recharts)
        |  REST/JSON, Authorization: Bearer <JWT>
        v
Amazon EC2 — Flask + Gunicorn (behind Nginx, HTTPS)
        |-- Amazon RDS for PostgreSQL (users, tasks, study_files metadata)
        |-- Amazon S3 private bucket (study-file bytes, presigned downloads)
```

Local development mirrors this with cheaper parts:

```text
Vite :5173 --> Flask :5000 (/api/*) --> SQLite (instance/taskflow.db)
                                        + local disk (backend/uploads/)
```

## Why each AWS service

- **Amplify** — hosts the static Vite build (`dist/`) over HTTPS with SPA
  rewrites; environment variable `VITE_API_BASE_URL` points at the API.
- **EC2** — runs the Flask API under Gunicorn + systemd (`deploy/taskflow.service`),
  Nginx in front for HTTPS and body limits. Chosen over serverless so a
  student can SSH in and see a normal Linux process.
- **RDS for PostgreSQL** — managed relational DB for the same SQLAlchemy models
  used with SQLite locally (`DATABASE_URL` switch). Lives in private subnets;
  only the EC2 security group may reach port 5432.
- **S3** — durable store for uploaded bytes; the DB keeps only metadata +
  `storage_key`. Bucket is private; downloads use 15-minute presigned URLs
  (or authenticated streaming for local mode).

## Data flows

1. **Auth** — React posts email/password; Flask verifies the bcrypt hash and
   returns a JWT (24h dev, 12h prod). Axios attaches it as `Bearer`.
2. **Tasks** — CRUD + dashboard stats are ownership-scoped by the JWT identity;
   `user_id` is never accepted from the client.
3. **Files** — upload validates extension/size/MIME, writes bytes via the
   storage adapter (local disk or S3) under a UUID key, then commits metadata.
   Storage failures never leave orphan metadata rows (rollback deletes bytes).
   Deleting a task keeps its files (`task_id` set to NULL); deleting a user
   cascades their tasks and files.

## Security notes

- IAM role on EC2 for S3 (no access keys in code or git); secrets only via
  environment / Secrets Manager; `.env` files are git-ignored.
- CORS allow-lists exact origins; JWT expiry + 401 logout on the client.
- Passwords are bcrypt hashes; hashes never appear in API responses.
- Central JSON error handlers never leak tracebacks, paths, or tokens.
