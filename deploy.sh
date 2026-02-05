#!/bin/bash

set -e

echo "Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="engagecore-backoffice"
APP_DIR="/home/ec2-user/engagecore-backoffice"
CONTAINER_NAME="engagecore-backoffice"

# Get version from argument or use latest
VERSION=${1:-latest}
if [ "$VERSION" = "latest" ]; then
    # Try to read from VERSION.txt if it exists
    if [ -f VERSION.txt ]; then
        VERSION=$(cat VERSION.txt)
    fi
fi

echo -e "${BLUE}Deploying version: $VERSION${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory if it doesn't exist
mkdir -p "$APP_DIR"

# Navigate to app directory
cd "$APP_DIR" || exit 1

echo -e "${GREEN}Loading Docker image...${NC}"
# Load the Docker image
if [ -f "engagecore-backoffice-$VERSION.tar.gz" ]; then
    docker load < "engagecore-backoffice-$VERSION.tar.gz"
    # Tag as latest for convenience
    docker tag "engagecore-backoffice:$VERSION" "engagecore-backoffice:latest" 2>/dev/null || true
elif [ -f "engagecore-backoffice-latest.tar.gz" ]; then
    docker load < engagecore-backoffice-latest.tar.gz
    VERSION="latest"
else
    echo -e "${RED}Error: Docker image file not found!${NC}"
    exit 1
fi

# Save version info
echo "$VERSION" > .current_version
if [ -f VERSION.txt ]; then
    cp VERSION.txt .deployed_version
fi

echo -e "${GREEN}Stopping existing container if running...${NC}"
# Stop and remove existing container if it exists
docker-compose down || true

# Keep old images for rollback (only prune dangling images, not versioned ones)
echo -e "${GREEN}Cleaning up dangling images (keeping versioned images for rollback)...${NC}"
docker image prune -f || true

# List available versions
echo -e "${BLUE}Available versions on this server:${NC}"
docker images engagecore-backoffice --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | head -10

echo -e "${GREEN}Starting new container with version: $VERSION${NC}"
# Update docker-compose to use the specific version
if [ "$VERSION" != "latest" ]; then
    # Create a temporary docker-compose override
    sed "s|engagecore-backoffice:latest|engagecore-backoffice:$VERSION|g" docker-compose.yml > docker-compose.versioned.yml
    docker-compose -f docker-compose.versioned.yml up -d
else
    # Start the new container
    docker-compose up -d
fi

echo -e "${GREEN}Waiting for container to be healthy...${NC}"
# Wait for container to be healthy
sleep 10

# Check if container is running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}Container is running successfully!${NC}"
    
    # Show container logs
    echo -e "${YELLOW}Container logs:${NC}"
    docker-compose logs --tail=50
    
    # Show container status
    echo -e "${YELLOW}Container status:${NC}"
    docker ps | grep "$CONTAINER_NAME"
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
else
    echo -e "${RED}Container failed to start. Checking logs...${NC}"
    docker-compose logs
    exit 1
fi

# Cleanup old tar files (keep last 5 versions)
echo -e "${GREEN}Cleaning up old deployment files (keeping last 5 versions)...${NC}"
ls -t engagecore-backoffice-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${BLUE}Current deployed version: $VERSION${NC}"
echo -e "${YELLOW}To rollback to a previous version, use: ./rollback.sh <version>${NC}"
echo -e "${YELLOW}To list all available versions, use: ./list-versions.sh${NC}"

