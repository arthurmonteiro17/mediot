# MedIoT

Sistema web do **MedIoT** — gerenciamento de estoque/almoxarifado com dashboard, ferramentas RFID, movimentações e banco SQLite via API.

**Produção:** [https://mediot.online](https://mediot.online) · API RFID: `POST https://mediot.online/api/rfid/scan`

## Como rodar (local)

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Deploy no VPS (`mediot.online`)

Guia completo: [`deploy/VPS.md`](deploy/VPS.md)

Resumo: VPS + Cloudflare (domínio Free) + túnel nomeado → URL HTTPS fixa, sem `trycloudflare.com`.

```bash
sudo bash deploy/setup-vps.sh
# depois: cloudflared tunnel login / create / route dns mediot mediot.online
```

## Módulos

| Rota | Função |
|------|--------|
| `/` | Dashboard: KPIs, alertas, gráfico, previsões |
| `/estoque` | Consulta, filtros e cadastro de produtos |
| `/movimentacoes` | Registrar entradas/saídas e ver histórico |

## Persistência

- Banco: SQLite (`prisma/dev.db` local; `prisma/prod.db` no VPS)
- ORM: Prisma
- APIs: `GET /api/bootstrap`, `POST /api/products`, `POST /api/movements`, `POST /api/rfid/scan`

Cadastros e movimentações sobrevivem ao refresh da página. A integração física usa `POST /api/rfid/scan` (ESP8266 envia UID do cartão + UID do produto).

### RFID / ESP8266

- Firmware de referência: [`firmware/esp8266_rfid_scan/`](firmware/esp8266_rfid_scan/) (HTTPS → `mediot.online`)
- Collection Postman: [`postman/MedIoT-RFID.postman_collection.json`](postman/MedIoT-RFID.postman_collection.json)

### Utilitários

```bash
npm run db:seed    # repovoa dados de demonstração
npm run db:reset   # zera e recria o banco
```

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
