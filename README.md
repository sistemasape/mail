# 📬 Email App — React + Vite + Supabase + Tauri

App de e-mail interno full-stack com mensagens em tempo real.

## Stack

| Camada     | Tecnologia          |
|------------|---------------------|
| UI         | React 18 + Vite     |
| Estilo     | CSS Modules / Tailwind |
| Estado     | Zustand             |
| Cache      | TanStack Query      |
| Backend    | Supabase (Postgres) |
| Realtime   | Supabase Channels   |
| Auth       | Supabase Auth       |
| Storage    | Supabase Storage    |
| Desktop    | Tauri 2             |

## Estrutura

```
email-app/
├── src-tauri/              ← Shell nativo Tauri
├── supabase/
│   └── schema.sql          ← Schema completo do banco
├── src/
│   ├── components/
│   │   ├── Layout/         ← Sidebar + painel principal
│   │   ├── EmailList/      ← Lista de e-mails
│   │   ├── EmailDetail/    ← Visualizador
│   │   ├── Compose/        ← Modal de composição
│   │   └── Auth/           ← Login / cadastro
│   ├── hooks/
│   │   └── useEmails.ts    ← Busca + realtime + actions
│   ├── lib/
│   │   └── supabase.ts     ← Client Supabase
│   ├── store/              ← Zustand (pasta ativa, email selecionado)
│   └── types/              ← Tipos TypeScript
├── .env.local              ← Variáveis de ambiente
└── package.json
```

## Início rápido

### 1. Pré-requisitos
- Node 20+
- Rust (para Tauri): https://rustup.rs
- Conta Supabase: https://supabase.com

### 2. Clonar e instalar
```bash
git clone <repo>
cd email-app
npm install
```

### 3. Configurar Supabase

Crie um projeto em [supabase.com](https://supabase.com) e execute o schema:
```bash
# Pelo painel SQL do Supabase, rode:
supabase/schema.sql
```

Crie o arquivo `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Rodar em modo web
```bash
npm run dev
```

### 5. Rodar como app desktop (Tauri)
```bash
npm run tauri dev
```

### 6. Build para distribuição
```bash
npm run tauri build
# Gera .dmg (macOS), .exe (Windows), .AppImage (Linux)
```

## Funcionalidades

- [x] Autenticação (e-mail/senha + OAuth Google/GitHub)
- [x] Caixa de entrada, enviados, rascunhos, lixeira
- [x] Realtime — novas mensagens sem recarregar
- [x] Busca full-text em português
- [x] Marcar como lido / estrelar
- [x] Mover para lixeira
- [x] Upload de anexos (Supabase Storage)
- [ ] Notificações desktop (Tauri API)
- [ ] Offline-first com cache local

## Importante: e-mails externos (SMTP/IMAP)

Este app usa Supabase como banco de dados para mensagens **internas**
(entre usuários do próprio sistema). Para enviar/receber e-mails reais:

- **Envio** → integre [Resend](https://resend.com) ou SendGrid via Supabase Edge Functions
- **Recebimento** → configure um servidor IMAP + sincronize via worker Node.js

## Licença

MIT
