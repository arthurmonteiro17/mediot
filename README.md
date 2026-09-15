# MedIoT

Dashboard web do **MedIoT 2.0** — sistema de gerenciamento de estoque hospitalar com rastreio RFID, ESP32 e Wi-Fi.

Esta é a primeira versão funcional do painel digital: KPIs, alertas, gráfico de entradas/saídas, movimentações recentes, previsão de falta e lista de produtos. Os dados ainda são de demonstração (domínio hospitalar realista), mas já são calculados a partir de um modelo de produtos + movimentações — o mesmo formato que depois conecta a um banco e ao hardware.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://127.0.0.1:43123](http://127.0.0.1:43123).

## O que o painel mostra

- Produtos cadastrados e unidades em estoque
- Itens com estoque baixo, crítico ou zerado
- Gráfico de entradas e saídas (7 dias)
- Central de alertas
- Movimentações recentes (com filtro entrada/saída e origem RFID)
- Previsão de possível falta com base no consumo médio

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts

## Próximos passos do projeto escolar

1. Persistência em banco de dados real
2. API de movimentações (entrada/saída)
3. Integração com leitor RFID + ESP32 via Wi-Fi
4. Substituição dos dados mock pelos eventos do hardware
