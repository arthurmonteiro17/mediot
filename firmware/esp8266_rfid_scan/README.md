# ESP8266 + MedIoT RFID

Produção (VPS + domínio):

```http
POST https://mediot.online/api/rfid/scan
Content-Type: application/json

{
  "userUid": "67:52:B0:A0",
  "productUid": "F5:76:82:B1"
}
```

Dev local: no sketch, `#define USE_HTTPS 0`, `API_HOST` = IP LAN do PC, `API_PORT` = `43123`.

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

1. Ajuste `WIFI_SSID` e `WIFI_PASSWORD` no sketch.
2. Produção: `USE_HTTPS 1` e `API_HOST = "mediot.online"` (já vem assim).
3. No VPS, siga [`../../deploy/VPS.md`](../../deploy/VPS.md) até `https://mediot.online` responder.
4. Os UIDs no banco devem ser **iguais** aos do leitor (incluindo `:`).

## Teste sem hardware

Importe [`../../postman/MedIoT-RFID.postman_collection.json`](../../postman/MedIoT-RFID.postman_collection.json) no Postman.  
Variável `baseUrl`: `https://mediot.online` (ou `http://127.0.0.1:43123` no PC).
