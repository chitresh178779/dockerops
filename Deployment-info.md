# DockerOps Deployment Guide

This document provides a step-by-step guide to deploying the **DockerOps** game from scratch, starting from creating a GitHub repository to deploying the frontend, backend, database, and isolated Docker sandbox engine.

---

## Architecture Overview

DockerOps is **not a simulator**—it runs a real Docker engine where players execute real commands inside isolated **Docker-in-Docker (DinD)** sandboxes. Because of this, the architecture consists of:

1. **Frontend (`apps/web`)**: Next.js 14 web application (terminal UI with xterm.js, topology map, audio/visuals, profile, level roster). Can be deployed to **Vercel** or on the same VPS.
2. **Backend API (`apps/api`)**: NestJS control plane handling REST endpoints, WebSocket connections for terminal PTY streaming, level condition inspection, and XP tracking.
3. **Database & Cache**: PostgreSQL (via Prisma) and Redis.
4. **Player Sandbox Host**: A server running the host Docker daemon with permissions to spin up `dockerops/sandbox:latest` privileged containers.

---

## Step 1: Initialize Git and Create GitHub Repository

### 1. Initialize Git Locally
Open a terminal in the project root (`d:\DOCKER_GAME`):

```bash
# Initialize local git repository
git init

# Stage all files (node_modules, .env, and dist are excluded by .gitignore)
git add .

# Create the initial commit
git commit -m "feat: initial commit of DockerOps game"
```

### 2. Create the Repository on GitHub
1. Open your browser and navigate to [github.com/new](https://github.com/new).
2. Set **Repository name** (e.g., `dockerops` or `docker-game`).
3. Set visibility to **Public** or **Private**.
4. **Leave all checkboxes unchecked** (do not initialize with README, .gitignore, or license).
5. Click **Create repository**.

### 3. Link Remote and Push
Run the following commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Set default branch to main
git branch -M main

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/dockerops.git

# Push the codebase
git push -u origin main
```

---

## Step 2: Infrastructure & Hosting Options

| Component | Recommended Platform | Specifications |
| :--- | :--- | :--- |
| **Frontend (`apps/web`)** | **Vercel** (Free Tier) | Automated CI/CD from GitHub, global edge CDN, automatic SSL. |
| **Backend (`apps/api`)** | **Linux VPS** (Ubuntu 22.04 / 24.04) | Minimum 2 vCPU, 2GB–4GB RAM (DigitalOcean Droplet, Hetzner Cloud, AWS EC2, or Linode). |
| **Sandbox Engine** | Same VPS as Backend | Runs host Docker daemon for player containers. |

*(Note: The backend requires access to a real Docker daemon to spawn player sandboxes, which is why serverless hosts like Vercel or AWS Lambda cannot host the backend API).*

---

## Step 3: Server Provisioning & Backend Setup

### 1. Connect to your VPS
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Required Dependencies (Docker, Node.js 20, pnpm)
```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Docker Engine
curl -fsSL https://get.docker.com | sh

# Enable and start Docker service
sudo systemctl enable --now docker

# Install Node.js 20 LTS and build tools
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Enable corepack and pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

### 3. Clone Repository and Install Dependencies
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/dockerops.git
cd dockerops

# Install monorepo dependencies
pnpm install
```

### 4. Build the Player Sandbox Image
The backend provisions real containers for players from this image:
```bash
docker build -t dockerops/sandbox:latest ./docker/sandbox
```

### 5. Start PostgreSQL and Redis
Start the database services using Docker Compose:
```bash
docker compose up -d postgres redis
```

Verify both services are running and healthy:
```bash
docker compose ps
```

### 6. Configure Backend Environment
Copy the example environment configuration:
```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env` (`nano apps/api/.env`):
```env
DATABASE_URL="postgresql://dockerops:dockerops@localhost:55432/dockerops"
REDIS_URL="redis://localhost:56379"
API_PORT=4000
WEB_ORIGIN="https://your-frontend-domain.vercel.app"
SANDBOX_IMAGE="dockerops/sandbox:latest"
SANDBOX_IDLE_TIMEOUT_MINUTES=45
```

### 7. Run Database Migrations and Seed Scenarios
```bash
# Run Prisma database migrations
pnpm db:migrate

# Seed levels and achievements
pnpm db:seed
```

### 8. Build Packages and Start API with PM2
Install PM2 to ensure the backend process runs continuously in the background and restarts on system reboot:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Build the shared packages and API
pnpm --filter @dockerops/shared build
pnpm --filter @dockerops/scenarios build
pnpm --filter @dockerops/api build

# Start the API service with PM2
pm2 start "pnpm --filter @dockerops/api start" --name "dockerops-api"

# Save process list and enable system startup
pm2 save
pm2 startup
```

---

## Step 4: Deploy the Frontend (`apps/web`) on Vercel

1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your `dockerops` repository.
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select `apps/web`
5. Configure **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com` (or `http://YOUR_SERVER_IP:4000` for testing)
   - `NEXT_PUBLIC_WS_URL` = `wss://api.yourdomain.com` (or `ws://YOUR_SERVER_IP:4000` for testing)
   - *(Note: Do NOT set `NEXT_PUBLIC_SHOW_MAINTAINER_TOOLS` in Vercel so public visitors only see "New levels added soon")*.
6. Click **Deploy**.

---

## Step 5: Domain, SSL, and Reverse Proxy Setup (HTTPS / WSS)

Because modern web browsers block unencrypted WebSockets (`ws://`) when accessed from an HTTPS website (`https://your-app.vercel.app`), your backend API must be secured with SSL (`https://` and `wss://`).

Using **Caddy** is the simplest and most automated method:

### 1. Install Caddy on your VPS
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y
```

### 2. Point DNS Record
In your domain DNS registrar (Cloudflare, Namecheap, GoDaddy, etc.):
- Add an **A Record**:
  - Name: `api` (e.g., `api.yourdomain.com`)
  - IPv4 address: `YOUR_SERVER_IP`

### 3. Configure Caddyfile
Edit `/etc/caddy/Caddyfile`:
```bash
sudo nano /etc/caddy/Caddyfile
```

Add:
```caddy
api.yourdomain.com {
    reverse_proxy localhost:4000
}
```

Restart Caddy (it automatically obtains and renews Let's Encrypt certificates):
```bash
sudo systemctl restart caddy
```

### 4. Update Frontend and Backend Endpoints
- In **Vercel Settings → Environment Variables**:
  - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`
  - `NEXT_PUBLIC_WS_URL` = `wss://api.yourdomain.com`
  - Redeploy the frontend.
- On your **VPS in `apps/api/.env`**:
  - `WEB_ORIGIN="https://your-frontend-domain.vercel.app"`
  - Restart the API: `pm2 restart dockerops-api`

---

## Maintenance & Useful Commands

### Viewing API Logs
```bash
pm2 logs dockerops-api
```

### Checking Sandbox Containers
```bash
# List active player sandboxes running on host
docker ps --filter "ancestor=dockerops/sandbox:latest"
```

### Updating Code on the Server
```bash
cd ~/dockerops
git pull origin main
pnpm install
pnpm --filter @dockerops/shared build
pnpm --filter @dockerops/scenarios build
pnpm --filter @dockerops/api build
pnpm db:migrate
pm2 restart dockerops-api
```
