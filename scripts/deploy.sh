#!/bin/bash

# ============================================
# Gold Price API - Manual Deployment Script
# สำหรับ deploy บน Ubuntu Server โดยตรง
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gold-price-api"
APP_DIR="/opt/gold-price-api"
PORT=3000

echo -e "${BLUE}🪙 Gold Price API - Deployment Script${NC}"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Installing Docker...${NC}"
    
    # Update package index
    sudo apt-get update
    
    # Install prerequisites
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up stable repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}✅ Docker installed successfully!${NC}"
fi

# Check if docker-compose is available
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Docker Compose...${NC}"
    sudo apt-get install -y docker-compose-plugin
fi

# Navigate to app directory
echo -e "${BLUE}📁 Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Copy files if running from source directory
if [ -f "./docker-compose.yml" ]; then
    echo -e "${BLUE}📄 Using local docker-compose.yml...${NC}"
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found in current directory.${NC}"
    echo -e "${YELLOW}   Make sure to copy project files to $APP_DIR${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker compose down 2>/dev/null || true

# Build and start containers
echo -e "${BLUE}🐳 Building and starting containers...${NC}"
docker compose up -d --build

# Wait for the application to start
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 10

# Health check
echo -e "${BLUE}🏥 Running health check...${NC}"
if curl -sf http://localhost:$PORT/health > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "${YELLOW}📋 Container logs:${NC}"
    docker compose logs --tail=50
    exit 1
fi

# Show status
echo ""
echo -e "${GREEN}========================================"
echo -e "🎉 Deployment Successful!"
echo -e "========================================${NC}"
echo ""
echo -e "📊 Application: ${BLUE}$APP_NAME${NC}"
echo -e "🌐 URL: ${BLUE}http://localhost:$PORT${NC}"
echo -e "📈 API Endpoints:"
echo -e "   - Health: ${BLUE}http://localhost:$PORT/health${NC}"
echo -e "   - Gold Price: ${BLUE}http://localhost:$PORT/api/gold/price${NC}"
echo -e "   - Price History: ${BLUE}http://localhost:$PORT/api/gold/history${NC}"
echo ""
echo -e "📋 Useful commands:"
echo -e "   - View logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "   - Stop: ${YELLOW}docker compose down${NC}"
echo -e "   - Restart: ${YELLOW}docker compose restart${NC}"
