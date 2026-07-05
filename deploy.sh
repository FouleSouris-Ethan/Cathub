#!/bin/bash
set -e

TARGET_DIR="${TARGET_DIR:-/var/www/html}"

echo "Pull des modifications..."
git pull --rebase origin main

echo "Copie du frontend vers $TARGET_DIR"
mkdir -p "$TARGET_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -av --delete pawplatform/Frontend/ "$TARGET_DIR"/
else
  cp -R pawplatform/Frontend/. "$TARGET_DIR"/
fi

echo "Redémarrage des containers..."
docker compose -f pawplatform/Backend/docker-compose.yml up -d --build

echo "Déploiement terminé"
