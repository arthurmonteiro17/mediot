# MedIoT

Sistema web do **MedIoT** — gerenciamento de estoque hospitalar com dashboard, controle de materiais, movimentações e **banco SQLite** via API.

## Como rodar

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Módulos

| Rota | Função |
|------|--------|
| `/` | Dashboard: KPIs, alertas, gráfico, previsões |
| `/estoque` | Consulta, filtros e cadastro de produtos |
| `/movimentacoes` | Registrar entradas/saídas e ver histórico |

## Persistência

- Banco: SQLite (`prisma/dev.db`)
- ORM: Prisma
- APIs: `GET /api/bootstrap`, `POST /api/products`, `POST /api/movements`

Cadastros e movimentações sobrevivem ao refresh da página. A integração com ESP32/RFID físico ainda não está ligada — a origem "RFID" no formulário simula o evento que o hardware enviará depois.

### Utilitários

```bash
npm run db:seed    # repovoa dados de demonstração
npm run db:reset   # zera e recria o banco
```

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
