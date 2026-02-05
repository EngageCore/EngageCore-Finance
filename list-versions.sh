#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ec2-user/engagecore-backoffice"

# Navigate to app directory
cd "$APP_DIR" || exit 1

echo -e "${BLUE}=== Available Versions ===${NC}"
echo ""

# Get current version
CURRENT_VERSION="unknown"
if [ -f .current_version ]; then
    CURRENT_VERSION=$(cat .current_version)
fi

echo -e "${GREEN}Currently deployed version: $CURRENT_VERSION${NC}"
echo ""

# List all versions
echo -e "${YELLOW}All available versions:${NC}"
docker images engagecore-backoffice --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | head -20

echo ""
echo -e "${BLUE}=== Version Files ===${NC}"

# Show version files
if [ -f .current_version ]; then
    echo -e "${GREEN}Current version: $(cat .current_version)${NC}"
fi

if [ -f .deployed_version ]; then
    echo -e "${GREEN}Last deployed version: $(cat .deployed_version)${NC}"
fi

if [ -f VERSION.txt ]; then
    echo -e "${GREEN}Version from last deployment: $(cat VERSION.txt)${NC}"
fi

echo ""
echo -e "${YELLOW}To rollback to a specific version, use:${NC}"
echo -e "${BLUE}  ./rollback.sh <version>${NC}"
echo ""
echo -e "${YELLOW}Example:${NC}"
echo -e "${BLUE}  ./rollback.sh a1b2c3d-20251201-021500${NC}"

