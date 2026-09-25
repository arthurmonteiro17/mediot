# Deploy MedIoT no Railway + domínio mediot.online

## 1. Conectar o GitHub

1. Em [railway.app](https://railway.app) → login com GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Escolha o repositório **mediot** (público)

## 2. Variáveis

Em **Variables**:

```
DATABASE_URL=file:/app/data/prod.db
```

Não precisa de `PORT` — o Railway define automaticamente.

## 3. Volume (SQLite)

**Settings → Volumes → Add Volume**

- Mount path: `/app/data`

Sem volume, o banco some a cada redeploy.

## 4. Domínio mediot.online

1. No Railway: **Settings → Networking → Generate Domain** (teste `*.up.railway.app`)
2. **Custom Domain** → `mediot.online` (e opcional `www.mediot.online`)
3. No Cloudflare DNS (proxied ou DNS only):
   - Tipo **CNAME**, nome `@` ou `mediot.online`, destino = hostname que o Railway mostrar
   - Ou o registro que o Railway indicar (às vezes é CNAME em `www` + redirect)

Espere o certificado HTTPS ficar Ready.

## 5. ESP8266 / Postman

API: `https://mediot.online/api/rfid/scan`  
(depois do domínio apontando; até lá use a URL `*.up.railway.app`)

## Observação

SQLite no Railway funciona com volume. Para produção pesada, Postgres é mais robusto — o schema Prisma atual é SQLite.
