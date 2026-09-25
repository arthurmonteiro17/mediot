# Deploy MedIoT no VPS — `mediot.online`

URL pública estável (sem túneis temporários):

| Uso | URL |
|-----|-----|
| Site | https://mediot.online |
| API RFID | https://mediot.online/api/rfid/scan |

## Pré-requisitos

1. VPS Ubuntu/Debian com IP público (ou só saída de internet, se usar Tunnel)
2. Domínio **mediot.online** com nameservers na **Cloudflare**
3. Conta Cloudflare gratuita
4. Este repositório no VPS

### Apontar o domínio para a Cloudflare

1. Em [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site** → `mediot.online`
2. Escolha o plano **Free**
3. Cloudflare mostra 2 nameservers (ex.: `ada.ns.cloudflare.com`)
4. No registrador onde comprou o domínio, troque os NS para esses
5. Espere o status ficar **Active** (pode levar minutos ou algumas horas)

## Opção recomendada: Cloudflare Tunnel (sem abrir porta 80/443)

### 1. Instalar o app no VPS

```bash
# No VPS — clone o repo e rode o setup
sudo git clone <URL-DO-REPO> /tmp/mediot-src
cd /tmp/mediot-src
sudo bash deploy/setup-vps.sh
```

Isso sobe o Next.js em `127.0.0.1:43123` via systemd (`mediot.service`).

### 2. Instalar cloudflared

```bash
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### 3. Criar o túnel nomeado

```bash
cloudflared tunnel login
# Abre um link — autorize o domínio mediot.online

cloudflared tunnel create mediot
# Anote o Tunnel ID (UUID) e o arquivo ~/.cloudflared/<UUID>.json
```

### 4. Configurar

```bash
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/<UUID>.json /etc/cloudflared/<UUID>.json

sudo nano /etc/cloudflared/config.yml
```

Use o modelo em [`cloudflared/config.yml`](./cloudflared/config.yml), trocando `TUNNEL_ID` pelo UUID real:

```yaml
tunnel: <UUID>
credentials-file: /etc/cloudflared/<UUID>.json

ingress:
  - hostname: mediot.online
    service: http://127.0.0.1:43123
  - hostname: www.mediot.online
    service: http://127.0.0.1:43123
  - service: http_status:404
```

### 5. DNS do túnel

```bash
cloudflared tunnel route dns mediot mediot.online
cloudflared tunnel route dns mediot www.mediot.online   # opcional
```

Isso cria CNAMEs na zona Cloudflare apontando para o túnel.

### 6. Rodar o túnel no boot

```bash
sudo cp /opt/mediot/deploy/systemd/cloudflared.service /etc/systemd/system/
# Se cloudflared não estiver em /usr/local/bin, ajuste ExecStart (which cloudflared)
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

### 7. Testar

```bash
curl -s https://mediot.online/api/bootstrap | head
curl -s -X POST https://mediot.online/api/rfid/scan \
  -H 'Content-Type: application/json' \
  -d '{"userUid":"67:52:B0:A0","productUid":"F5:76:82:B1"}'
```

No ESP8266, use o firmware com `API_HOST = "mediot.online"` (HTTPS).

## Opção alternativa: Nginx + Let's Encrypt

Se preferir sortar o Tunnel e expor 80/443 no firewall:

1. App em `127.0.0.1:43123` (mesmo `setup-vps.sh`)
2. A na Cloudflare / DNS: `mediot.online` → IP do VPS (proxy laranja opcional)
3. Nginx reverse proxy + `certbot --nginx -d mediot.online`

O Tunnel costuma ser mais simples (sem abrir portas).

## Atualizar o app depois

```bash
cd /opt/mediot
sudo -u mediot git pull   # se o deploy for via git
# ou rode de novo: sudo bash deploy/setup-vps.sh
sudo -u mediot npm ci
sudo -u mediot npx prisma migrate deploy
sudo -u mediot npm run build
sudo systemctl restart mediot
```

## Custo

| Item | Custo |
|------|--------|
| Cloudflare (DNS + Tunnel Free) | Grátis |
| Domínio mediot.online | Já comprado |
| VPS | Mensalidade do provedor |

## Troubleshooting

| Sintoma | O que checar |
|---------|----------------|
| DNS não resolve | Nameservers Cloudflare ativos? `dig mediot.online NS` |
| 502 no site | `systemctl status mediot` — app caiu? |
| Túnel offline | `systemctl status cloudflared` e logs: `journalctl -u cloudflared -f` |
| ESP HTTPS falha | No sketch, `setInsecure()` liberado (certificado Cloudflare no BearSSL) |
