#!/usr/bin/env bash
# Start MedIoT in production (Railway / VPS).
# Runs migrations; seeds only when the database is empty.
set -euo pipefail

npx prisma migrate deploy

EMPTY="$(npx tsx scripts/check-db-empty.ts)"

if [[ "${EMPTY}" == "0" ]]; then
  echo "Banco vazio — rodando seed inicial..."
  npx prisma db seed
fi

exec npx next start --port "${PORT:-43123}"
