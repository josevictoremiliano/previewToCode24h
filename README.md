# Preview to Code 24h

Sistema completo de geração de sites com IA integrada. Este projeto permite que usuários solicitem sites personalizados e que administradores gerenciem todo o processo com processamento de IA interno.

## 🚀 Funcionalidades

### Para Usuários
- ✅ Solicitação de projetos com formulário detalhado
- ✅ Acompanhamento de status dos projetos
- ✅ Sistema de notificações em tempo real
- ✅ Dashboard personalizado

### Para Administradores
- ✅ Gestão completa de usuários e projetos
- ✅ Sistema de gestão de IA integrado
- ✅ Configuração de modelos de IA (Groq, OpenAI, etc.)
- ✅ Templates de prompts personalizáveis
- ✅ Processamento de projetos com IA interno
- ✅ Logs e métricas de uso

## 🛠️ Tecnologias

- **Framework:** Next.js 16.0.1 com Turbopack
- **Autenticação:** NextAuth.js com suporte a múltiplos provedores
- **Banco de Dados:** Prisma ORM (SQLite/PostgreSQL)
- **IA:** OpenAI SDK configurado para Groq
- **UI:** Tailwind CSS + Shadcn/ui
- **Segurança:** Criptografia AES-256-GCM para API keys

## 🏗️ Configuração

### 1. Instalação

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 2. Configuração do Banco de Dados

```bash
npx prisma generate
npx prisma db push
```

### 3. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Encryption Key (32 caracteres)
ENCRYPTION_KEY="your-32-character-encryption-key"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Executar o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 👤 Primeiro Acesso

1. Faça login com qualquer provedor OAuth
2. Acesse o banco de dados e altere o `role` do seu usuário para `ADMIN`
3. Acesse `/admin` para configurar o sistema

## 🤖 Configuração da IA

1. Acesse `/admin/ai` (apenas administradores)
2. Adicione uma configuração de IA:
   - **Nome:** Nome identificador
   - **Modelo:** ex: `llama3-8b-8192`
   - **API Key:** Sua chave da Groq/OpenAI
   - **Base URL:** `https://api.groq.com/openai/v1` (para Groq)
3. Crie templates de prompts personalizados
4. Teste as configurações

## 📁 Estrutura do Projeto

```
app/
├── admin/              # Painel administrativo
│   ├── ai/            # Gestão de IA
│   ├── projects/      # Gestão de projetos
│   └── users/         # Gestão de usuários
├── api/               # Endpoints da API
├── auth/              # Configuração de autenticação
├── dashboard/         # Dashboard do usuário
└── projects/          # Páginas de projetos

lib/
├── ai-processor.ts    # Processamento de IA
├── auth.ts           # Configuração NextAuth
├── crypto.ts         # Funções de criptografia
├── db.ts            # Cliente Prisma
└── utils.ts         # Utilitários

prisma/
├── schema.prisma     # Schema do banco
└── migrations/       # Migrações
```

## 🔒 Segurança

- **Criptografia:** API keys são criptografadas com AES-256-GCM
- **Autenticação:** NextAuth com provedores OAuth
- **Autorização:** Sistema baseado em roles (USER/ADMIN)
- **Validação:** Zod para validação de dados

## 📊 Métricas e Logs

O sistema registra automaticamente:
- Uso de IA (tokens, custo, tempo)
- Ações administrativas
- Erros e performance
- Notificações enviadas

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Configure um banco PostgreSQL
4. Deploy automático

### Outros Provedores

1. Build do projeto: `npm run build`
2. Configure variáveis de ambiente
3. Execute: `npm start`

## 📝 Licença

Este projeto é privado e proprietário.

## 🤝 Contribuição

Para contribuir:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas alterações
4. Abra um Pull Request

## 📞 Suporte

Para suporte técnico, entre em contato através dos canais oficiais.
