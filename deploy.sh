#!/bin/bash
set -e

echo "Pull des modifications..."
git pull --rebase origin main

echo "Copie du frontend"
cp -R pawplatform/Frontend/. /var/www/html/ 2>/dev/null || true

echo "Redémarrage des containers..."
docker compose -f pawplatform/Backend/docker-compose.yml up -d --build

echo "Déploiement terminé"
