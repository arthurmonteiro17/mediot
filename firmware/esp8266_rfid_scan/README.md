# ESP8266 + MedIoT RFID

O firmware em [`esp8266_rfid_scan.ino`](./esp8266_rfid_scan.ino) envia:

```http
POST http://<IP-DO-PC>:43123/api/rfid/scan
Content-Type: application/json

{
  "userUid": "CARD-8841",
  "productUid": "TAG-LUV-M-01"
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

## Configuração

1. No sketch, ajuste `WIFI_SSID`, `WIFI_PASSWORD` e `API_HOST` (IP LAN do PC — **não** use `127.0.0.1`).
2. No PC: `npm run dev` (porta `43123`).
3. Cadastre no MedIoT os mesmos UIDs que o leitor MFRC522 envia (`Staff.rfidCard` e `Product.rfidTag`).

## Teste sem hardware

Importe [`../../postman/MedIoT-RFID.postman_collection.json`](../../postman/MedIoT-RFID.postman_collection.json) no Postman.
