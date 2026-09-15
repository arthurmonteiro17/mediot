# MedIoT

Sistema web do **MedIoT 3.0** — gerenciamento de estoque hospitalar com dashboard, controle de materiais e movimentações (base para RFID + ESP32).

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Módulos

| Rota | Função |
|------|--------|
| `/` | Dashboard: KPIs, alertas, gráfico, previsões |
| `/estoque` | Consulta, filtros e cadastro de produtos |
| `/movimentacoes` | Registrar entradas/saídas e ver histórico |

As movimentações atualizam o estoque na sessão (estado compartilhado no navegador). Ainda não há banco persistente — o próximo passo natural é API + banco e depois o ESP32.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts
