# Deployment Guide — Ubuntu Server

This guide covers deploying the ITIL Change Management App to an Ubuntu server with Nginx serving the frontend and systemd managing the Node API.

## Architecture

```
Browser → Nginx :80
              ├── /*      → /opt/itil-app/dist/  (built React app)
              └── /api/*  → localhost:3001        (Node/Express API)
                                └── PostgreSQL
```

---

## Prerequisites

Install these on the Ubuntu server if not already present:

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx
sudo apt install -y nginx

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Git
sudo apt install -y git
```

---

## 1 — Create the app user and database

```bash
# Create a dedicated Linux user (no login shell needed)
sudo adduser --system --group --no-create-home itil

# Create the Postgres user and database
sudo -u postgres psql <<SQL
CREATE USER itil WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE itil_change_mgmt OWNER itil;
SQL
```

Replace `CHANGE_THIS_PASSWORD` with a strong random password.

---

## 2 — Deploy the application

```bash
# Clone the repo
sudo mkdir -p /opt/itil-app
sudo git clone https://github.com/YOUR_USERNAME/itil-change-management.git /opt/itil-app
sudo chown -R itil:itil /opt/itil-app

# Install frontend dependencies and build
cd /opt/itil-app
sudo -u itil npm install
sudo -u itil npm run build

# Install API dependencies
cd /opt/itil-app/api
sudo -u itil npm install

# Create the .env file (only needed for Prisma CLI commands like db:push and db:seed)
# The running API gets its DATABASE_URL from systemd, not this file
sudo -u itil bash -c 'cat > /opt/itil-app/api/.env <<EOF
DATABASE_URL=postgresql://itil:CHANGE_THIS_PASSWORD@localhost:5432/itil_change_mgmt
EOF'
sudo chmod 600 /opt/itil-app/api/.env

# Push the schema to Postgres
cd /opt/itil-app/api
sudo -u itil npm run db:push

# Seed with the standard change templates
sudo -u itil npm run db:seed
```

---

## 3 — Set up the systemd service

```bash
# Copy the service file
sudo cp /opt/itil-app/deploy/itil-api.service /etc/systemd/system/itil-api.service

# Edit it to set the real database password
sudo nano /etc/systemd/system/itil-api.service
# → Replace CHANGE_THIS_PASSWORD with your actual password

# Lock down the file so only root can read it
sudo chmod 600 /etc/systemd/system/itil-api.service

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable itil-api
sudo systemctl start itil-api

# Check it's running
sudo systemctl status itil-api
```

To view live logs:
```bash
sudo journalctl -u itil-api -f
```

---

## 4 — Set up Nginx

```bash
# Copy the Nginx config
sudo cp /opt/itil-app/deploy/nginx-itil.conf /etc/nginx/sites-available/itil

# If you want to set a specific hostname, edit the server_name line
sudo nano /etc/nginx/sites-available/itil

# Enable the site
sudo ln -s /etc/nginx/sites-available/itil /etc/nginx/sites-enabled/itil

# Remove the default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test the config and reload
sudo nginx -t
sudo systemctl reload nginx
```

The app is now accessible at `http://your-server-ip/`.

---

## 5 — Updating the app

When you push new code to GitHub:

```bash
cd /opt/itil-app

# Pull latest code
sudo -u itil git pull

# Rebuild the frontend
sudo -u itil npm install
sudo -u itil npm run build

# Update API dependencies if package.json changed
cd api && sudo -u itil npm install && cd ..

# Restart the API
sudo systemctl restart itil-api

# Nginx serves the new dist/ automatically — no reload needed
```

---

## Useful commands

| Task | Command |
|---|---|
| View API logs | `sudo journalctl -u itil-api -f` |
| Restart API | `sudo systemctl restart itil-api` |
| Stop API | `sudo systemctl stop itil-api` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Connect to DB | `sudo -u itil psql -d itil_change_mgmt` |
| Check Nginx config | `sudo nginx -t` |
