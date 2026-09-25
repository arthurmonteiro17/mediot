#!/usr/bin/env bash
# Start MedIoT in production (Railway / VPS).
# Runs migrations; seeds only when the database is empty.
set -euo pipefail

npx prisma migrate deploy

EMPTY="$(npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const n = await p.hospitalSettings.count();
await p.\$disconnect();
process.stdout.write(String(n));
")"

if [[ "${EMPTY}" == "0" ]]; then
  echo "Banco vazio — rodando seed inicial..."
  npx prisma db seed
fi

exec npx next start --port "${PORT:-43123}"
