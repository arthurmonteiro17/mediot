# ESP8266 + MedIoT RFID

O firmware em [`esp8266_rfid_scan.ino`](./esp8266_rfid_scan.ino) envia:

```http
POST http://<IP-DO-PC>:43123/api/rfid/scan
Content-Type: application/json

{
  "userUid": "67:52:B0:A0",
  "productUid": "F5:76:82:B1"
}
```

## Respostas

| HTTP | Significado |
|------|-------------|
| 201 + `action: "saida"` | Produto retirado (estoque -1) |
| 201 + `action: "devolucao"` | Mesmo usuário devolveu (estoque +1) |
| 403 | Outro usuário tentou devolver |
| 404 | Cartão ou tag não cadastrados |
| 400 | Estoque insuficiente / payload inválido |

## UIDs cadastrados (seed)

**Crachás:** Arthur `67:52:B0:A0`, Enrico `77:0C:B2:A0`, Luís Guilherme `97:5D:A3:A0`, Pedro Miguel `07:D7:81:A0`, Yago `F7:F4:8F:A0`

**Produtos:** Furadeira `F5:76:82:B1`, Parafusadeira `47:5F:A1:A0`, Multímetro `B7:9B:AC:A0`, Alicate amperímetro `A7:5F:BB:A0`, Caixa de ferramentas `D7:23:9F:A0`, Extensão 20m `87:44:8E:A0`

## Configuração

1. No sketch, ajuste `WIFI_SSID`, `WIFI_PASSWORD` e `API_HOST` (IP LAN do PC — **não** use `127.0.0.1`).
2. No PC: `npm run dev` (porta `43123`).
3. Os UIDs no banco devem ser **iguais** aos enviados pelo leitor (incluindo `:`).

## Teste sem hardware

Importe [`../../postman/MedIoT-RFID.postman_collection.json`](../../postman/MedIoT-RFID.postman_collection.json) no Postman.
