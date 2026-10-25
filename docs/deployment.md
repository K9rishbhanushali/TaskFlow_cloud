# AWS deployment guide (do this only after local tests pass)

> Cost warning: RDS and EC2 incur charges. Prefer Free-Tier sizes
> (e.g. `db.t3.micro`, `t3.micro`), and read the Cleanup section first so
> you know how to stop everything.

## 0. Prerequisites

- Local app green: `pytest` 11 passed, `npm run build` succeeds.
- An AWS account with a budget alarm; pick one region (e.g. `ap-south-1`)
  and use it for everything.

## 1. RDS for PostgreSQL

1. RDS Console → Create database → PostgreSQL → Free Tier template.
2. DB name `taskflow`, user `taskflow`, strong password (store in Secrets Manager).
3. Connectivity: place in **private subnets** (or at least "Not publicly
   accessible"); create a security group `taskflow-db-sg` allowing inbound
   `5432` **only** from the backend security group.
4. Note the endpoint. Locally verify connectivity from your machine only if
   you temporarily allow your IP; production traffic comes from EC2.

## 2. EC2 backend

1. Launch Ubuntu `t3.micro` in the same VPC, security group `taskflow-api-sg`:
   inbound `22` (your IP), `80/443` (world or ALB), **no direct DB port**.
2. SSH in and install: `sudo apt update && sudo apt install -y python3-venv python3-dev nginx postgresql-client`.
3. Copy the repo, create venv, install: `pip install -r requirements.txt`.
4. Write `backend/.env` from `.env.production.example` (real secrets!).
5. Run migrations: `flask --app run db upgrade`.
6. Install the service: `sudo cp deploy/taskflow.service /etc/systemd/system/`
   then `sudo systemctl enable --now taskflow`.
7. Nginx: adapt `deploy/nginx-taskflow.conf`, `sudo nginx -t && sudo systemctl reload nginx`.
8. HTTPS: point your domain at the instance and issue a cert
   (`certbot --nginx`), or terminate TLS at an ALB.
9. Check `https://<api-domain>/api/health` → `{"status":"ok","db":"up"}`.

## 3. Amplify frontend

1. Push `frontend/` to your git repo; Amplify Console → New app → Host web app.
2. Build settings: uses `amplify.yml` (`npm ci` + `npm run build`, `dist/`).
3. Environment variables: `VITE_API_BASE_URL=https://<api-domain>/api`.
4. Rewrites: SPA rule `</^[^.]+$|.../> → /index.html (200)` (see
   `.env.production.example` comment). Redeploy and test register → tasks →
   notes end-to-end over HTTPS.

## 4. Cleanup (avoid unwanted charges)

1. Amplify: delete the app (or stop hosting).
2. EC2: stop the instance when idle; **terminate** it (plus EBS volumes and
   Elastic IP if unused) when the project is over.
3. RDS: take a final snapshot if needed, then **delete** the instance
   (snapshots also cost a little — delete them too when done).
4. Check Billing → Free Tier usage and confirm $0 active resources.
