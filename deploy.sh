#!/bin/bash
set -e

NAME="engagecore-finance"
NEEDS_ENV=0

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# Deploy into the directory this script lives in. The workflow scp's the image
# tarball and compose file alongside it, so this is always the right target.
# (Previously hardcoded /home/ec2-user/... which breaks on any host whose login
# user is not ec2-user.)
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# Compose v2 ships as a docker plugin; v1 (`docker-compose`) is not installed.
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo -e "${RED}Docker Compose is not available.${NC}"; exit 1
fi

VERSION=${1:-latest}
if [ "$VERSION" = "latest" ] && [ -f VERSION.txt ]; then VERSION=$(cat VERSION.txt); fi
echo -e "${BLUE}Deploying $NAME version: $VERSION${NC}"
echo -e "${BLUE}Directory: $APP_DIR   Compose: $DC${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is not installed.${NC}"; exit 1; }

mkdir -p logs uploads

if [ "$NEEDS_ENV" = "1" ] && [ ! -f .env ]; then
  # Deliberately NOT generating a template here. The old script wrote one
  # containing real-looking DB credentials, which then silently started the
  # container against the wrong database.
  echo -e "${RED}.env is missing in $APP_DIR.${NC}"
  echo -e "${YELLOW}Create it before deploying (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET...).${NC}"
  exit 1
fi

# The app network is created once, outside any single compose project.
docker network inspect engage-net >/dev/null 2>&1 || \
  docker network create --driver bridge --subnet 172.20.0.0/16 --gateway 172.20.0.1 engage-net

echo -e "${GREEN}Loading image...${NC}"
if   [ -f "$NAME-$VERSION.tar.gz" ]; then
  docker load < "$NAME-$VERSION.tar.gz"
  docker tag "$NAME:$VERSION" "$NAME:latest" 2>/dev/null || true
elif [ -f "$NAME-latest.tar.gz" ]; then
  docker load < "$NAME-latest.tar.gz"; VERSION="latest"
else
  echo -e "${RED}No image tarball found in $APP_DIR${NC}"; exit 1
fi
echo "$VERSION" > .current_version

echo -e "${GREEN}Restarting container...${NC}"
$DC down || true
docker image prune -f >/dev/null 2>&1 || true

if [ "$VERSION" != "latest" ]; then
  sed "s|$NAME:latest|$NAME:$VERSION|g" docker-compose.yml > docker-compose.versioned.yml
  $DC -f docker-compose.versioned.yml up -d
else
  $DC up -d
fi

echo -e "${GREEN}Waiting for container...${NC}"
for i in $(seq 1 18); do
  sleep 5
  # Template handles containers with no healthcheck. Relying on inspect failing
  # does not work: it writes a blank line to stdout first, so `|| echo none`
  # yields "
none" and never compares equal.
  STATUS=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$NAME" 2>/dev/null || echo "none")
  RUNNING=$(docker inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null || echo "false")
  if [ "$STATUS" = "healthy" ] || { [ "$STATUS" = "none" ] && [ "$RUNNING" = "true" ]; }; then
    echo -e "${GREEN}$NAME is up (health: $STATUS).${NC}"
    docker ps --filter "name=$NAME" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    ls -t "$NAME"-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
    echo -e "${GREEN}Deployed $NAME version $VERSION.${NC}"
    exit 0
  fi
  [ "$RUNNING" = "false" ] && break
done

echo -e "${RED}$NAME failed to come up. Logs:${NC}"
$DC logs --tail=60
exit 1
