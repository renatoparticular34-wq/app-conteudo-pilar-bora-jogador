# ⚡ Artigo Pilar — Automatizador de Blocos de Monetização

Aplicativo web completo para automatizar a inserção de **blocos de monetização e engajamento** em posts WordPress via REST API.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 O que faz?

O app recebe a URL do artigo (ou ID do post) e links de monetização, e aplica automaticamente:

| Bloco | Descrição | Posição |
|-------|-----------|---------|
| **A** | CTA Lead Magnet (download PDF) | Topo do conteúdo |
| **B** | Banner Hostinger (afiliado) | Meio do artigo |
| **C** | Amazon 3 Produtos | Antes do FAQ |
| **D** | Micro CTAs (checklist + hostinger) | Dentro do texto |
| **E** | Checklist Visual + Próximos Passos | Antes da conclusão |
| **Quiz** | Quiz SEO interativo (dark theme) | Antes do FAQ |

Todos inseridos como blocos HTML (compatível com Gutenberg e Classic Editor), preservando o conteúdo original.

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js 18+** instalado
- **WordPress** com REST API habilitada
- **Application Password** configurada no WP (veja abaixo)

### Instalação

```bash
# Clone ou copie o projeto
cd app-artigo-pilar

# Instale as dependências
npm install

# (Opcional) Copie o arquivo de configuração
copy .env.example .env

# Inicie o servidor
npm start
```

O app estará disponível em: **http://localhost:3000**

---

## 🔑 Como Criar Application Password no WordPress

1. Acesse o **WordPress Admin** → **Usuários** → **Perfil**
2. Role até a seção **"Senhas de Aplicativo"** (Application Passwords)
3. No campo **"Nome da Nova Senha de Aplicativo"**, digite um nome (ex: "ArticlePilar")
4. Clique em **"Adicionar nova senha de aplicativo"**
5. **Copie a senha gerada** (ela será exibida apenas uma vez!)
6. Use o **username do WordPress** + essa senha no app

> ⚠️ **Nota:** O username é o login do WP, não o email. Verifique em Usuários → Perfil → campo "Nome de usuário".

> 💡 **Dica:** Se a seção "Senhas de Aplicativo" não aparecer, pode ser necessário ativar via plugin (Application Passwords) ou garantir que o site usa HTTPS.

---

## 📖 Como Usar

### 1. Configure a Conexão
- Insira a URL do site WordPress (ex: `https://conteudix.com`)
- Insira o username e Application Password
- Clique em **"Testar Conexão"** para verificar

### 2. Carregue o Post
- Cole a URL do post OU insira o Post ID
- Clique em **"Carregar Post"**
- O app exibirá: título, status, headings detectados, blocos existentes

### 3. Configure os Links
- **Lead Magnet**: URL do PDF (Google Drive ou link direto)
- **Hostinger**: Link de afiliado
- **Amazon**: 3 links de produtos
- **Próximos Passos**: 3 URLs internas do site

### 4. Selecione os Blocos
- Marque/desmarque os blocos que deseja inserir [A, B, C, D, E, Quiz]
- Personalize cores se necessário

### 5. Preview
- Clique em **"Gerar Preview"** para ver:
  - Quantos blocos serão inseridos
  - Onde cada bloco será posicionado
  - Diff do conteúdo (antes/depois)

### 6. Aplicar
- Clique em **"Aplicar no WordPress"** para publicar as alterações
- Um backup automático é criado em `./backups/`

---

## 🏗️ Estrutura do Projeto

```
app-artigo-pilar/
├── server.js                    # Servidor Express (backend)
├── package.json                 # Dependências
├── .env.example                 # Variáveis de ambiente
├── engine/
│   ├── insertion-engine.js      # Motor de inserção (core)
│   ├── templates.js             # Templates HTML dos blocos
│   └── wordpress-api.js         # Cliente WordPress REST API
├── public/
│   ├── index.html               # Frontend HTML
│   ├── style.css                # Estilos (dark theme)
│   └── app.js                   # Frontend JavaScript
├── tests/
│   └── insertion-engine.test.js # Testes unitários
├── backups/                     # Backups automáticos (JSON)
└── presets/                     # Presets salvos
```

---

## 🧪 Testes

```bash
npm test
```

Roda os testes unitários do motor de inserção, verificando:
- Extração de headings
- Detecção de seções (TOC, FAQ, Conclusão)
- Posicionamento correto dos blocos
- Prevenção de duplicação
- Edge cases (conteúdo vazio, sem headings, etc.)

---

## 🌐 Deploy

### Local
```bash
npm start
# Acesse http://localhost:3000
```

### Render
1. Crie um novo **Web Service** em [render.com](https://render.com)
2. Conecte ao repositório Git
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure a variável de ambiente `PORT` (Render define automaticamente)

### Railway
1. Crie um novo projeto em [railway.app](https://railway.app)
2. Import do repositório Git
3. Deploy automático!

### VPS / Hostinger
```bash
# No servidor
git clone <repo> && cd app-artigo-pilar
npm install
PORT=3000 node server.js
# Ou use PM2:
npm install -g pm2
pm2 start server.js --name artigo-pilar
```

---

## ⚡ Troubleshooting

### Erro 401 — Autenticação
- Verifique se o username é o **login do WordPress** (não o email)
- Verifique se a Application Password está correta (com espaços, como gerada)
- Certifique-se de que o site usa **HTTPS**

### Erro 404 — Post não encontrado
- Verifique se a URL ou ID do post está correto
- Posts com status "rascunho" também são acessíveis via API

### LiteSpeed Cache
- Após aplicar blocos, **limpe o cache** no WP Admin → LiteSpeed Cache → Purge All
- O Quiz SEO usa JS inline para ser compatível com defer/async do LiteSpeed
- Se o CSS dos blocos não aparecer, verifique se o LiteSpeed não está minificando HTML inline

### Blocos não aparecem
- Verifique se o tema suporta blocos HTML no Gutenberg
- No Classic Editor, os blocos são inseridos como HTML puro
- Verifique se algum plugin de segurança não está removendo `<style>` ou `<script>` inline

### CORS
- O backend já inclui middleware CORS. Se hospedar frontend e backend separados, configure a origin correta.

---

## 📋 Exemplos

### Links de exemplo
```
- Site URL: https://conteudix.com
- Post URL: https://conteudix.com/como-fazer-seo/
- Lead Magnet: https://drive.google.com/file/d/1ABC123/view
- Hostinger: https://hostinger.com.br?ref=conteudix
- Amazon Livro: https://amzn.to/3ABC123
- Amazon Notebook: https://amzn.to/3DEF456
- Amazon Mouse: https://amzn.to/3GHI789
```

### Usando Presets
1. Configure todos os links uma vez
2. Clique em **"💾 Salvar Preset"** e dê um nome
3. Para próximos artigos, clique em **"📋 Presets"** e carregue

---

## 📄 Licença

MIT — use como quiser.
