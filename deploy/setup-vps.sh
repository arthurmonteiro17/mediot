#!/usr/bin/env bash
# Setup inicial do MedIoT no VPS (Ubuntu/Debian).
# Rode como root a partir da pasta do repositório clonado, ou:
#   curl ... | bash  (após ajustar)
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/mediot}"
APP_USER="${APP_USER:-mediot}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Rode como root: sudo bash deploy/setup-vps.sh"
  exit 1
fi

echo "==> Pacotes base"
apt-get update -y
apt-get install -y curl ca-certificates git rsync

if ! command -v node >/dev/null 2>&1; then
  echo "==> Instalando Node.js 22.x"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> Usuário ${APP_USER}"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "${APP_USER}"

echo "==> App em ${APP_DIR}"
mkdir -p "${APP_DIR}"
# Se o script está dentro do repo, copia; senão assume que já clonou em APP_DIR
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
if [[ -f "${REPO_ROOT}/package.json" ]]; then
  rsync -a --delete --exclude node_modules --exclude .git --exclude prisma/dev.db \
    "${REPO_ROOT}/" "${APP_DIR}/"
fi

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "==> Dependências, migrate, seed, build"
cd "${APP_DIR}"
if [[ ! -f .env ]]; then
  cp .env.example .env
  # Produção: banco em caminho absoluto sob o app
  sed -i 's|file:./dev.db|file:/opt/mediot/prisma/prod.db|' .env
fi

sudo -u "${APP_USER}" npm ci
sudo -u "${APP_USER}" npx prisma migrate deploy
sudo -u "${APP_USER}" npx prisma db seed || true
sudo -u "${APP_USER}" npm run build

echo "==> systemd MedIoT"
cp "${APP_DIR}/deploy/systemd/mediot.service" /etc/systemd/system/mediot.service
systemctl daemon-reload
systemctl enable --now mediot.service

echo ""
echo "MedIoT rodando em http://127.0.0.1:43123"
echo "Próximo passo: configurar Cloudflare Tunnel (veja deploy/VPS.md)"
echo "  cloudflared tunnel login"
echo "  cloudflared tunnel create mediot"
echo "  cloudflared tunnel route dns mediot mediot.online"
