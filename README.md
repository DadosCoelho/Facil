# Facil — Plataforma Web de Apostas (Lotofácil da Independência)

Facil é um projeto web simples, responsivo e focado na praticidade para gestão de apostas da Lotofácil da Independência. Um administrador gera links de acesso individuais (convites) e participantes autorizados usam esses links para criar jogos, escolher números e comprar quantas cotas quiserem. Todos os jogos são registrados em uma Planilha do Google (Google Sheets). O deploy é pensado para ser direto na Vercel.

> Aviso: Este projeto é para fins educacionais/demonstrativos. A responsabilidade por conformidade legal e regulatória é do operador do sistema. Não constitui aconselhamento jurídico.

---

## Índice

- Visão Geral
- Recursos
- Arquitetura
- Stack Técnica
- Requisitos
- Preparação do Google Sheets
- Preparação do Google Drive para Comprovantes
- Variáveis de Ambiente
- Instalação e Execução (Local)
- Estrutura do Projeto
- Fluxos de Uso
- API (Endpoints)
- Regras de Negócio e Validações
- Segurança
- Deploy na Vercel
- Testes
- Observabilidade e Logs
- Roadmap
- Licença

---

## Visão Geral

O objetivo é oferecer uma plataforma mínima, segura e escalável o suficiente para:
- Convidar pessoas específicas através de links assinados (JWT).
- Permitir que convidadas criem jogos válidos da Lotofácil (15 a 20 números, 1 a N cotas).
- Receber e armazenar comprovantes PIX (imagens) no Google Drive.
- Persistir cada jogo automaticamente em uma planilha no Google Sheets.
- Obter relatórios simples a partir da planilha.
- Operar com baixo custo e pouca fricção, via Vercel.

---

## Recursos

- Links de convite individuais, com expiração, uso único e amarração a uma campanha (ex.: “Independência 2025”).
- Interface limpa e responsiva, mobile-first.
- Validação de regras da Lotofácil (quantidade de dezenas, intervalo 1–25, sem repetição, etc.).
- Quantidade de cotas flexível por jogo (definível por participante).
- Upload e armazenamento de comprovantes PIX (imagens) no Google Drive.
- Registro em Google Sheets com colunas normalizadas para auditoria.
- Painel mínimo para o administrador gerar convites e verificar status.
- Configuração simples via variáveis de ambiente.
- Deploy pronto para Vercel (serverless).

---

## Arquitetura

- Frontend: Next.js (App Router) + React + Tailwind CSS.
- Backend (APIs): Rotas do Next.js (serverless) para:
  - Geração de convites (admin).
  - Criação de jogos (participante).
  - Upload de comprovantes (participante).
  - Integração com Google Sheets (append de linhas).
  - Integração com Google Drive (upload de arquivos).
- Autorização:
  - Convites assinados com JWT (contêm campaignId, inviteId, singleUse, exp).
  - Endpoints administrativos protegidos (lista de emails admin, header secreto ou proteção por environment).
- Persistência principal: Google Sheets (registro imutável por linha).
- Opcional (cache/estado): armazenamento em memória ou revalidação leve; não é obrigatório.

Fluxo resumido:
1. Admin cria convite → link único assinado.
2. Participante acessa o link → formulário de jogo.
3. Participante seleciona números e cotas → anexa comprovante PIX (imagem) → envia.
4. API valida → salva o comprovante no Google Drive e obtém o link → grava uma linha na planilha (incluindo o link do comprovante) → retorna confirmação.
5. Admin audita pela planilha e/ou baixa CSV.

---

## Stack Técnica

- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- TypeScript
- zod (validações)
- jose (JWT)
- googleapis (Sheets API, Drive API)
- ESLint + Prettier
- (Opcional) @vercel/analytics para métricas simples
- (Opcional) Rate limit (ex.: implementação própria em memória ou Upstash)

---

## Requisitos

- Node.js 18+
- Conta Google Cloud com projeto e Sheets API e Drive API habilitadas
- Service Account com chave JSON e acesso à planilha e à pasta de comprovantes no Drive
- Conta Vercel (para deploy)
- Planilha no Google com abas e colunas recomendadas (ver seção “Preparação do Google Sheets”)
- Pasta dedicada no Google Drive para comprovantes PIX.

---

## Preparação do Google Sheets

1. Crie uma planilha no Google Sheets (ex.: “Facil — Loto Independência”).
2. Crie as abas:
   - Config (opcional): chave-valor para ajustes (Ex.: campanha ativa, min/max cotas).
   - Jogos: registro principal de cada jogo.
   - Participantes (opcional): cadastro básico (nome, email, inviteId).
   - Convites (opcional): log de convites emitidos e status (usado, expirado).
   - Auditoria (opcional): eventos (login via convite, criação de jogo, cancelamento).
3. Compartilhe a planilha com o email da Service Account (Editor).
4. Guarde o ID da planilha (o trecho entre /d/ e /edit na URL).

Colunas sugeridas da aba “Jogos”:
- timestamp
- campaignId
- inviteId
- participantId (opcional; pode ser derivado do token)
- jogoId (UUID gerado pela API)
- numeros (string, ex.: “01 02 03 ... 15”)
- quantidadeDezenas
- cotas
- precoPorCota (opcional)
- totalCotasJogo (cotas)
- status (ex.: “ativo”, “cancelado”)
- origem (ex.: “web”)
- userAgent (opcional)
- ipHash (opcional, para privacidade)
- observacoes (opcional)

Dica: use validação de dados no Sheets para evitar erros manuais e filtros para análise.

---

## Variáveis de Ambiente

Crie um arquivo .env.local (local) e configure as variáveis também na Vercel (Project Settings → Environment Variables).

Obrigatórias:
- GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_da_planilha
- GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@seu-projeto.iam.gserviceaccount.com
- GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...chave...\n-----END PRIVATE KEY-----\n"
  - Na Vercel, mantenha os “\n” literais.
- JWT_SECRET=uma_chave_aleatoria_segura
- APP_URL=https://seu-deploy.vercel.app

Recomendadas:
- ADMIN_EMAILS=admin1@dominio.com,admin2@dominio.com
- DEFAULT_CAMPAIGN_ID=independencia-2025
- INVITE_EXP_HOURS=72
- MAX_BETS_PER_INVITE=100
- LOTOFACIL_MIN_DEZENAS=15
- LOTOFACIL_MAX_DEZENAS=20
- ENABLE_SINGLE_USE_INVITE=true

---

## Instalação e Execução (Local)

1. Clone o repositório:
   - git clone https://github.com/sua-org/facil.git
   - cd facil
2. Instale dependências:
   - npm install
3. Configure o .env.local (ver seção anterior).
4. Rode em desenvolvimento:
   - npm run dev
5. Acesse:
   - http://localhost:3000

Scripts úteis:
- npm run dev — modo desenvolvimento
- npm run build — build de produção
- npm run start — rodar localmente em produção
- npm run lint — lint
- npm run typecheck — checagem TypeScript

---

## Estrutura do Projeto

Sugestão (App Router):

- app/
  - layout.tsx
  - page.tsx (landing)
  - admin/
    - page.tsx (UI simples p/ gerar convites)
  - invite/
    - [token]/
      - page.tsx (formulário do participante)
  - api/
    - admin/
      - invites/route.ts (POST: cria convite/link assinado)
    - bets/route.ts (POST: cria jogo → grava no Sheets)
    - sheets/
      - health/route.ts (GET: teste de conexão)
- lib/
  - jwt.ts (assinar/verificar convites)
  - sheets.ts (cliente Google Sheets)
  - validation.ts (schemas zod)
  - rules.ts (regras de negócio)
  - utils.ts
- components/
  - BetForm.tsx
  - AdminInviteForm.tsx
  - Alert.tsx / Button.tsx, etc.
- styles/
  - globals.css (Tailwind)
- public/
  - favicon, logo, etc.

---

## Fluxos de Uso

Admin:
1. Acessa /admin (restrição por email admin ou token de admin).
2. Preenche dados do convite:
   - campaignId (default: DEFAULT_CAMPAIGN_ID)
   - singleUse (true/false)
   - validade (horas)
   - metadados do convidado (nome/email — opcional)
3. Gera link → copia e envia ao participante.
4. Acompanha status pela planilha.

Participante (via link):
1. Abre o link /invite/[token].
2. App valida token (assinatura e expiração).
3. Formulário exibe campanha e instruções.
4. Participante seleciona de 15 a 20 números (1–25, sem repetição) e define cotas.
5. Envia → API valida, grava no Sheets e retorna confirmação com jogoId.
6. Exibe confirmação e botão “Criar outro jogo” (se permitido).

---

## API (Endpoints)

- POST /api/admin/invites
  - Protegido (admin).
  - Body:
    - campaignId?: string
    - singleUse?: boolean
    - expHours?: number
    - participant?: { name?: string; email?: string }
  - Resposta:
    - { link: string, tokenPreview: string, inviteId: string, exp: number }

- POST /api/bets
  - Público com token de convite válido (enviado em Authorization: Bearer <token> ou no body).
  - Body:
    - token: string (ou via header)
    - numeros: number[] (15–20, cada um 1–25 sem repetição)
    - cotas: number (>=1)
    - precoPorCota?: number (se aplicável)
  - Resposta:
    - { jogoId: string, status: "ok", savedAt: string }

- GET /api/sheets/health
  - Retorna 200 se conseguir acessar a planilha.
  - Resposta:
    - { ok: true, sheetId: string }

Observações:
- Limite de taxa recomendado (ex.: 5 req/min por IP) para /api/bets.
- Logs mínimos: inviteId, campaignId, jogoId, timestamp.

---

## Regras de Negócio e Validações

- Convite:
  - Assinado (JWT) com payload: { inviteId, campaignId, singleUse, exp, participant? }.
  - Expiração obrigatória.
  - Opcional singleUse: após primeiro uso, deve ser marcado como “usado” (pelo menos na planilha ou cache) e negado em novos envios.
- Jogo:
  - numeros: 15 a 20 dezenas.
  - Cada dezena: inteiro 1–25, sem repetição.
  - cotas: inteiro >= 1 (limite via MAX_BETS_PER_INVITE opcional).
  - campaignId do token deve estar “ativa” (definível na planilha Config).
- Persistência:
  - Append de linha no Sheets; não sobrescrever para manter trilha de auditoria.
  - Se cancelamento for necessário, inserir nova linha com status = “cancelado” referenciando jogoId original.
- Auditoria:
  - Registrar eventos relevantes: criação de convite, uso de convite, criação de jogo, falhas de validação.

---

## Segurança

- JWT assinado com chave forte (JWT_SECRET).
- Convites com expiração curta (ex.: 72h) e opcionalmente singleUse.
- Sanitização de entrada e validação rígida (zod).
- Minimizar dados pessoais no token (evitar email no payload; use inviteId).
- No Sheets, preferir armazenar identificadores em vez de dados sensíveis. Se necessário, ofuscar IP (hash) e não armazenar PII.
- Endpoints admin apenas para ADMIN_EMAILS (validados pelo provedor de login ou cabeçalho secreto em ambiente restrito).
- CORS restrito (se exposto fora da mesma origem).
- Não exponha GOOGLE_SERVICE_ACCOUNT_KEY no client. Toda escrita ocorre no server.

---

## Deploy na Vercel

1. Crie um novo projeto e conecte ao repositório Git.
2. Configure as variáveis de ambiente em Project Settings → Environment Variables:
   - GOOGLE_SHEETS_SPREADSHEET_ID
   - GOOGLE_SERVICE_ACCOUNT_EMAIL
   - GOOGLE_SERVICE_ACCOUNT_KEY (com “\n” literais)
   - JWT_SECRET
   - APP_URL
   - Outras recomendadas (ADMIN_EMAILS, DEFAULT_CAMPAIGN_ID, etc.)
3. Defina o framework como Next.js (auto-detect).
4. Faça o primeiro deploy.
5. Teste:
   - GET /api/sheets/health (deve retornar ok: true).
   - POST /api/admin/invites (gere um link).
   - Abra o link e crie um jogo (confira a planilha).

Dicas:
- Se usar proteção por email admin, integre um provedor simples (por ex., magic link próprio, cabeçalho temporário ou NextAuth, se optar).
- Ative Password Protection no preview se necessário.
- Monitore logs no painel da Vercel.

---

## Testes

- Unitários:
  - Validações (zod): números, cotas, payload do convite.
  - Regras de negócio (singleUse, expiração).
- Integração:
  - /api/bets com token válido e inválido.
  - Escrita no Google Sheets (usar planilha de teste).
- E2E (opcional):
  - Playwright/Cypress: fluxo convite → criação de jogo → verificação no Sheets (mock).
- Critérios de aceite (exemplos):
  - Convite expirado não permite jogo.
  - Jogo inválido não é salvo no Sheets.
  - Jogo válido gera uma linha na aba “Jogos”.

Scripts sugeridos:
- npm test (jest/vitest opcional)
- npm run e2e (opcional)

---

## Observabilidade e Logs

- Logs de servidor:
  - Sucesso/erro nas chamadas ao Sheets.
  - Validação de token (sem expor payload sensível).
  - Geração de convites (inviteId, campaignId).
- (Opcional) @vercel/analytics para métricas leves.
- (Opcional) Sentry para rastreio de erros.

Retenção de logs:
- Evitar PII.
- Reduzir nível de detalhe em produção (warnings/erros).

---

## Roadmap

- MVP:
  - Convites (admin).
  - Criação de jogos (participante).
  - Escrita no Google Sheets.
- Próximas iterações:
  - Painel de leitura (leitura do Sheets para relatórios simples).
  - Rate limiting nos endpoints públicos.
  - Cancelamento/edição controlados.
  - Exportação CSV em UI admin.
  - Integração com pagamento (ex.: registro do status da cota).
  - Internacionalização (i18n).
  - Testes E2E automatizados.
  - Tematização (dark mode).

---

## Licença

MIT — sinta-se livre para usar, adaptar e contribuir.

---

## Dicas Finais

- Mantenha a planilha organizada: filtros, validação de dados e aba de Auditoria.
- Controle de versão das regras (anote mudanças na aba Config).
- Faça backups periódicos da planilha.
- Para escalar, considere transicionar para um banco (ex.: Postgres) mantendo o Sheets como camada de exportação/relatório.

Bom desenvolvimento! 🚀