#!/bin/bash
set -e

REPO="Saavuori/RuuviGateway"
BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}"
INSTALL_DIR="${1:-ruuvigateway}"

echo "==> Installing RuuviGateway into ./${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "==> Downloading docker-compose.yml..."
curl -fsSL "${BASE_URL}/docker-compose.yml" -o docker-compose.yml

if [ ! -f config.yml ]; then
  echo "==> Downloading config.sample.yml..."
  curl -fsSL "${BASE_URL}/config.sample.yml" -o config.yml
  echo ""
  echo "  !! config.yml created from sample. Edit it before starting:"
  echo "     nano ${INSTALL_DIR}/config.yml"
else
  echo "==> config.yml already exists, skipping."
fi

echo ""
echo "==> Done! Next steps:"
echo "  1. Edit config.yml:       nano config.yml"
echo "  2. Start the gateway:     docker compose up -d"
echo "  3. Open the Web UI:       http://$(hostname -I | awk '{print $1}'):8080"
