# 🚀 Deploy na Hostinger — Guia Passo a Passo

## Pré-requisitos
- Plano Hostinger **Business** ou **Cloud** (suporta Node.js)
- Acesso ao **hPanel** da Hostinger

---

## Opção 1: Deploy via Git (Recomendado)

### Passo 1 — Subir o código para o GitHub

1. Abra o terminal na pasta do projeto
2. Execute:

```bash
git init
git add .
git commit -m "deploy: app artigo pilar v1.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/app-artigo-pilar.git
git push -u origin main
```

### Passo 2 — Configurar Node.js na Hostinger

1. Acesse o **hPanel** → `https://hpanel.hostinger.com`
2. No menu lateral, clique em **Avançado** → **Node.js**
3. Clique em **Criar novo aplicativo**
4. Configure:
   - **Versão do Node.js**: `18` ou superior
   - **Diretório do aplicativo**: `/home/usuario/domains/SEUSITE/app-artigo-pilar`
     (ou o subdomínio que preferir)
   - **Comando de início**: `npm start`
   - **Porta**: será atribuída automaticamente (a variável `PORT` é definida pela Hostinger)

### Passo 3 — Conectar GitHub

1. Na seção Node.js do hPanel, clique em **Git**
2. Cole a URL do repositório: `https://github.com/SEU-USUARIO/app-artigo-pilar.git`
3. Defina a branch: `main`
4. Clique em **Deploy**

### Passo 4 — Instalar dependências

1. No hPanel → **Avançado** → **Terminal** (ou via SSH)
2. Navegue até a pasta do app:
```bash
cd domains/SEUSITE/app-artigo-pilar
```
3. Instale as dependências:
```bash
npm install --production
```

### Passo 5 — Iniciar o aplicativo

1. Volte para **Avançado** → **Node.js**
2. Clique em **Reiniciar** no seu aplicativo
3. O app estará disponível no endereço configurado!

---

## Opção 2: Deploy via File Manager / FTP (Alternativa simples)

### Passo 1 — Preparar o ZIP

1. Na pasta do projeto, crie um ZIP contendo **TUDO** exceto:
   - `node_modules/` (será instalado no servidor)
   - `.env` (criar direto no servidor)
   - `backups/` (dados locais)
   - `presets/` (dados locais)

**Arquivos que DEVEM estar no ZIP:**
```
├── engine/
│   ├── game-generator.js
│   ├── insertion-engine.js
│   ├── product-suggester.js
│   ├── templates.js
│   └── wordpress-api.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── tests/
│   └── insertion-engine.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

### Passo 2 — Upload via hPanel

1. **hPanel** → **Gerenciador de Arquivos**
2. Navegue até a pasta desejada:
   - Para domínio principal: `/home/usuario/domains/SEUSITE/public_html/app`
   - Para subdomínio: `/home/usuario/domains/app.SEUSITE/public_html`
3. Faça upload do ZIP
4. Extraia o ZIP no servidor

### Passo 3 — Configurar Node.js

1. **hPanel** → **Avançado** → **Node.js**
2. **Criar novo aplicativo**:
   - Versão: `18+`
   - Diretório: caminho onde extraiu os arquivos
   - Startup file: `server.js`
3. Clique em **Criar**

### Passo 4 — Instalar e Iniciar

1. **hPanel** → **Avançado** → **Terminal**
2. Execute:
```bash
cd caminho/do/app
npm install --production
```
3. Volte em **Node.js** → **Reiniciar**

---

## Opção 3: Deploy via VPS Hostinger (Controle total)

Se você tem um VPS na Hostinger:

### Passo 1 — Conectar via SSH
```bash
ssh root@SEU-IP-VPS
```

### Passo 2 — Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Passo 3 — Clonar e configurar
```bash
cd /var/www
git clone https://github.com/SEU-USUARIO/app-artigo-pilar.git
cd app-artigo-pilar
npm install --production
```

### Passo 4 — Configurar PM2 (manter rodando)
```bash
npm install -g pm2
pm2 start server.js --name "artigo-pilar"
pm2 save
pm2 startup
```

### Passo 5 — Configurar Nginx (proxy reverso)
```nginx
server {
    listen 80;
    server_name app.seusite.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Depois ative:
```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Verificação pós-deploy

1. Acesse `https://app.seusite.com` (ou o endereço configurado)
2. Deve aparecer a interface do App Artigo Pilar
3. Teste a conexão com seu WordPress
4. Carregue um post e faça um preview

## 🔒 Segurança (Importante!)

- **Adicione autenticação** se o app ficar público (qualquer pessoa poderá acessar)
- **Use HTTPS** sempre (a Hostinger fornece SSL grátis)
- **Não exponha credenciais** do WordPress no código

---

## 📝 Troubleshooting

| Problema | Solução |
|----------|---------|
| App não inicia | Verifique os logs: `pm2 logs artigo-pilar` (VPS) ou Logs no hPanel |
| Porta em uso | A Hostinger define a porta via `process.env.PORT` — não force uma porta fixa |
| npm install falha | Verifique se a versão do Node é >= 18: `node -v` |
| CORS error | O app já inclui `cors()` middleware — deve funcionar |
| Timeout na API WP | Verifique se o WordPress permite conexões externas |
