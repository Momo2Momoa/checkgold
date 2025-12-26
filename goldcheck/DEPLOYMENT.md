# 🚀 Deployment Guide - Gold Price API

## 📋 Overview

This guide explains how to deploy the Gold Price API using Docker on an Ubuntu server with CI/CD automation via GitHub Actions.

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   GitHub Repo   │─────▶│  GitHub Actions  │─────▶│  Ubuntu Server  │
│   (Push/PR)     │      │  (Build & Push)  │      │  (Docker)       │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

---

## 📦 Prerequisites

### On Ubuntu Server:
- Docker Engine 20.10+
- Docker Compose 2.0+
- SSH access enabled
- Ports 3000 open (or your configured port)

### On GitHub:
- Repository secrets configured (see below)

---

## 🔐 Required GitHub Secrets

Go to your repository → Settings → Secrets and Variables → Actions, and add:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SERVER_HOST` | Your Ubuntu server IP or domain | `192.168.1.100` or `api.example.com` |
| `SERVER_USER` | SSH username | `ubuntu` or `root` |
| `SERVER_SSH_KEY` | Private SSH key for authentication | (paste your private key) |
| `SERVER_PORT` | SSH port (optional, default: 22) | `22` |

### How to create SSH key:
```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server

# Copy private key content for GitHub secret
cat ~/.ssh/id_ed25519
```

---

## 🐳 Quick Deploy (Manual)

### Option 1: Using Docker Compose on Server

```bash
# SSH into your server
ssh user@your-server

# Clone the repository
git clone https://github.com/your-username/goldcheck.git /opt/gold-price-api

# Navigate to directory
cd /opt/gold-price-api

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Option 2: Using Docker directly

```bash
# Build the image
docker build -t gold-price-api .

# Run the container
docker run -d \
  --name gold-price-api \
  --restart unless-stopped \
  -p 3000:3000 \
  gold-price-api
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow runs automatically when:
- **Push** to `main` or `master` branch
- **Pull Request** to `main` or `master` branch

### Pipeline Stages:

1. **🧪 Test** - Syntax check and lint
2. **🐳 Build** - Build Docker image and push to GitHub Container Registry
3. **🚀 Deploy** - SSH to server and update container

---

## 📡 API Endpoints

After deployment, your API will be available at:

| Endpoint | Description |
|----------|-------------|
| `GET /` | API info and available endpoints |
| `GET /health` | Health check |
| `GET /api/gold/price` | Current gold price |
| `GET /api/gold/history` | Price history |
| `GET /api/gold/refresh` | Force refresh price |
| `GET /api/gold/compare` | Compare gold prices |

---

## 🛠️ Useful Commands

### Docker Commands on Server:

```bash
# View running containers
docker ps

# View logs
docker logs -f gold-price-api

# Restart container
docker restart gold-price-api

# Stop container
docker stop gold-price-api

# Remove container
docker rm gold-price-api

# Clean up old images
docker image prune -f
```

### Docker Compose Commands:

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Check status
docker compose ps
```

---

## 🔧 Troubleshooting

### Container not starting:
```bash
# Check logs
docker logs gold-price-api

# Check if port is in use
sudo lsof -i :3000
```

### Permission issues:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart Docker service
sudo systemctl restart docker
```

### Health check failing:
```bash
# Test endpoint manually
curl http://localhost:3000/health

# Check container internal network
docker exec gold-price-api wget -qO- http://localhost:3000/health
```

---

## 🔒 Security Recommendations

1. **Use non-root user** ✅ (already configured in Dockerfile)
2. **Restrict SSH access** - Use key-based authentication only
3. **Firewall** - Only open necessary ports
4. **Keep updated** - Regularly update Docker and Node.js images
5. **Use HTTPS** - Set up reverse proxy (Nginx/Traefik) with SSL

### Example Nginx Reverse Proxy:

```nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring

### Check container health:
```bash
docker inspect --format='{{.State.Health.Status}}' gold-price-api
```

### View resource usage:
```bash
docker stats gold-price-api
```

---

## 📝 License

MIT License
