#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ec2-user/engagecore-backoffice"
CONTAINER_NAME="engagecore-backoffice"

# Check if version argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version not specified${NC}"
    echo -e "${YELLOW}Usage: ./rollback.sh <version>${NC}"
    echo -e "${YELLOW}Example: ./rollback.sh a1b2c3d-20251201-021500${NC}"
    echo ""
    echo -e "${BLUE}Available versions:${NC}"
    docker images engagecore-backoffice --format "{{.Tag}}" | grep -v latest | sort -r | head -10
    exit 1
fi

VERSION=$1

# Navigate to app directory
cd "$APP_DIR" || exit 1

# Check if version exists
if ! docker images engagecore-backoffice | grep -q "$VERSION"; then
    echo -e "${RED}Error: Version '$VERSION' not found${NC}"
    echo -e "${YELLOW}Available versions:${NC}"
    docker images engagecore-backoffice --format "{{.Tag}}" | grep -v latest | sort -r | head -10
    exit 1
fi

# Get current version
CURRENT_VERSION="latest"
if [ -f .current_version ]; then
    CURRENT_VERSION=$(cat .current_version)
fi

echo -e "${BLUE}Rolling back from version: $CURRENT_VERSION${NC}"
echo -e "${BLUE}Rolling back to version: $VERSION${NC}"

# Confirm rollback
read -p "Are you sure you want to rollback to version $VERSION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo -e "${GREEN}Stopping current container...${NC}"
docker-compose down || true

# If using versioned compose file, remove it
rm -f docker-compose.versioned.yml

echo -e "${GREEN}Rolling back to version: $VERSION${NC}"

# Create docker-compose override for the specific version
sed "s|engagecore-backoffice:latest|engagecore-backoffice:$VERSION|g" docker-compose.yml > docker-compose.versioned.yml

# Start container with the rolled back version
docker-compose -f docker-compose.versioned.yml up -d

echo -e "${GREEN}Waiting for container to start...${NC}"
sleep 10

# Check if container is running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}Container is running successfully with version: $VERSION${NC}"
    
    # Update current version
    echo "$VERSION" > .current_version
    
    # Show container logs
    echo -e "${YELLOW}Container logs:${NC}"
    docker-compose -f docker-compose.versioned.yml logs --tail=50
    
    # Show container status
    echo -e "${YELLOW}Container status:${NC}"
    docker ps | grep "$CONTAINER_NAME"
    
    echo -e "${GREEN}Rollback completed successfully!${NC}"
    echo -e "${BLUE}Current version: $VERSION${NC}"
else
    echo -e "${RED}Container failed to start. Checking logs...${NC}"
    docker-compose -f docker-compose.versioned.yml logs
    exit 1
fi

