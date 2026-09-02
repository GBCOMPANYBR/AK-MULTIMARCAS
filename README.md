# AK Multimarcas

Site comercial + sistema de gestão de locação de veículos da AK Multimarcas.

- **Site público** (`/`): landing page com frota, diferenciais, depoimentos, FAQ e contato via WhatsApp.
- **Painel administrativo** (`/admin`): dashboard, gestão de frota, clientes, locações (com checklist,
  cálculo automático de km excedente/diárias extras/combustível, contrato e recibo em PDF), financeiro,
  relatórios e usuários.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 · Prisma 7 (PostgreSQL) · NextAuth (Auth.js) v5 ·
`@react-pdf/renderer` · Recharts · Zod · react-hook-form · react-imask.

## Requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou hospedado — Vercel Postgres, Neon, Supabase etc.)

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` (copie de `.env.example` se preferir) e configure:

   ```
   DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
   AUTH_SECRET="uma-string-aleatoria-segura"
   ```

   Gere um `AUTH_SECRET` com `openssl rand -base64 32`.

3. Rode as migrações e o seed inicial (cria usuários, veículos, clientes e locações de exemplo):

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Site público: [http://localhost:3000](http://localhost:3000)
   Painel admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Credenciais de acesso (seed)

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | admin@akmultimarcas.com.br | admin123 |
| Operador | operador@akmultimarcas.com.br | operador123 |

**Troque essas senhas antes de usar em produção.**

## Estrutura do projeto

```
app/
  page.tsx                 # site público (one-page)
  admin/
    (auth)/login/          # login do painel
    (dashboard)/           # dashboard, frota, clientes, locações, financeiro, relatórios, usuários
  api/
    auth/[...nextauth]/    # NextAuth
    locacoes/[id]/contrato # geração de contrato em PDF
    locacoes/[id]/recibo   # geração de recibo em PDF
    relatorios/export      # exportação CSV
    relatorios/export-pdf  # exportação PDF
components/
  ui/                      # componentes base (botão, card, form, etc.)
  admin/                   # formulários e componentes do painel
  site/                    # seções do site público
lib/
  actions/                 # Server Actions (mutações: veículos, clientes, locações, financeiro...)
  queries/                 # leituras (dashboard, relatórios)
  validations/             # schemas Zod
  rental-calculations.ts   # núcleo do sistema: cálculo de diárias, km excedente, combustível etc.
  pdf/                     # templates dos PDFs (contrato, recibo, relatório)
prisma/
  schema.prisma
  seed.ts
```

## Regras de negócio importantes

- Veículos só aparecem no site público quando **Status = Disponível/Alugado/Manutenção** (não Inativo) e
  a flag **"Exibir no site"** está marcada.
- Ao confirmar uma locação, o veículo muda automaticamente para **Alugado**; ao registrar a devolução,
  volta para **Disponível** e o **KM atual** é atualizado.
- Km excedente, diárias extras (atraso) e diferença de combustível são calculados automaticamente na
  devolução — lógica centralizada em `lib/rental-calculations.ts`.
- Perfis: **Administrador** (acesso total, inclusive financeiro e exclusões) e **Operador** (cria
  locações/devoluções, sem acesso ao financeiro completo nem exclusões).

## Deploy (Vercel)

1. Crie um banco Postgres (Vercel Postgres/Neon/Supabase) e copie a connection string.
2. No projeto da Vercel, configure as variáveis de ambiente `DATABASE_URL` e `AUTH_SECRET`.
3. Rode as migrações contra o banco de produção uma vez (localmente, apontando `DATABASE_URL` para o
   banco de produção): `npm run db:migrate` (ou `npx prisma migrate deploy` em CI).
4. Rode o seed (opcional, apenas para popular dados de demonstração): `npm run db:seed`.
5. Faça o deploy normalmente — o build já roda `prisma generate` automaticamente
   (`npm run build` = `prisma generate && next build`).

> As fotos enviadas pelo admin (veículos e checklists) são salvas em `public/uploads/`. Em produção na
> Vercel, esse diretório é efêmero (não persiste entre deploys/instâncias) — para uso real, migre o
> upload para um storage externo (ex: Vercel Blob, S3, Cloudinary) antes de ir ao ar.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | inicia o servidor de desenvolvimento |
| `npm run build` | gera o client do Prisma e builda para produção |
| `npm run start` | inicia o servidor em modo produção |
| `npm run db:migrate` | aplica as migrações do Prisma |
| `npm run db:seed` | popula o banco com dados de exemplo |
| `npm run db:studio` | abre o Prisma Studio (navegador visual do banco) |
