# Facil — Plataforma Web de Gestão de Apostas

Facil é um projeto web simples, responsivo e focado na praticidade para gestão de apostas da Lotofácil da Independência. Um administrador gera links de acesso individuais (convites) e participantes autorizados usam esses links para criar jogos, escolher números e adquirir cotas. Todas as apostas e comprovantes de pagamento são registrados e armazenados em um sistema de dados remoto e serviço de armazenamento de arquivos em nuvem. O deploy é otimizado para ser direto na Vercel.

> Aviso: Este projeto é para fins educacionais/demonstrativos. A responsabilidade por conformidade legal e regulatória é do operador do sistema. Não constitui aconselhamento jurídico.

---

## Índice

- Visão Geral
- Recursos
- Arquitetura
- Stack Técnica
- Requisitos
- Preparação do Ambiente de Dados
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
- Receber e armazenar comprovantes PIX (imagens) em um serviço de armazenamento de arquivos em nuvem.
- Persistir cada aposta automaticamente em um sistema de dados remoto.
- Obter relatórios simples a partir dos dados armazenados.
- Operar com baixo custo e pouca fricção, via Vercel.

---

## Recursos

- Links de convite individuais, com expiração, uso único e amarração a uma campanha (ex.: “Independência 2025”).
- Interface limpa e responsiva, mobile-first.
- Validação de regras da Lotofácil (quantidade de dezenas, intervalo 1–25, sem repetição, etc.).
- Quantidade de cotas flexível por jogo (definível por participante).
- Upload e armazenamento de comprovantes PIX (imagens) em um serviço de armazenamento de arquivos em nuvem.
- Registro em um sistema de dados remoto com colunas normalizadas para auditoria.
- Painel mínimo para o administrador gerar convites e verificar status.
- Configuração simples via variáveis de ambiente.
- Deploy pronto para Vercel (serverless).

---

## Arquitetura

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS.
- **Backend (APIs)**: Rotas do Next.js (serverless) para:
    - Geração de convites (admin).
    - Criação de apostas (participante).
    - Upload de comprovantes (participante).
    - Integração com o sistema de dados remoto (adição de registros).
    - Integração com o serviço de armazenamento de arquivos em nuvem (upload de arquivos).
- **Autorização**:
    - Convites assinados com JWT (contêm campaignId, inviteId, singleUse, exp).
    - Endpoints administrativos protegidos (lista de emails admin, header secreto ou proteção por ambiente).
- **Persistência principal**: Um sistema de dados remoto (registro imutável por linha/documento).
- **Armazenamento de arquivos**: Um serviço de armazenamento de arquivos em nuvem dedicado para comprovantes.
- **Opcional (cache/estado)**: armazenamento em memória ou revalidação leve; não é obrigatório.

Fluxo resumido:
1. Admin cria convite → link único assinado.
2. Participante acessa o link → formulário de aposta.
3. Participante seleciona números e cotas → anexa comprovante PIX (imagem) → envia.
4. API valida → salva o comprovante no serviço de armazenamento em nuvem e obtém o link → grava um registro no sistema de dados remoto (incluindo o link do comprovante) → retorna confirmação.
5. Admin audita pelos dados armazenados e/ou baixa CSV.

---

## Stack Técnica

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- zod (validações)
- jose (JWT)
- Firebase Realtime Database (para dados)
- Serviço de armazenamento de arquivos em nuvem (para comprovantes, ex: Firebase Storage, Cloudinary, S3)
- ESLint + Prettier
- (Opcional) @vercel/analytics para métricas simples
- (Opcional) Rate limit (ex.: implementação própria em memória ou Upstash)

---

## Requisitos

- Node.js 18+
- Credenciais de serviço para o sistema de dados remoto e o serviço de armazenamento de arquivos em nuvem.
- Conta Vercel (para deploy).
- Estrutura de dados configurada no sistema de dados remoto (ex: coleções/tabelas para apostas, campanhas).
- Pasta/bucket dedicado no serviço de armazenamento de arquivos para comprovantes PIX.

---

## Preparação do Ambiente de Dados

1.  Configure sua instância do sistema de dados remoto e serviço de armazenamento de arquivos em nuvem.
2.  Crie as estruturas necessárias (ex: coleções, tabelas, buckets) para `apostas`, `campanhas` e `convites`.
3.  Configure as permissões para que a aplicação possa ler e escrever nos locais apropriados usando suas credenciais de serviço.
4.  Guarde os IDs necessários (ex: ID da coleção de apostas, ID do bucket de comprovantes).

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` (local) e configure as variáveis também na Vercel (Project Settings → Environment Variables).

Obrigatórias:
- `JWT_SECRET`=uma_chave_aleatoria_segura
- `APP_URL`=https://seu-deploy.vercel.app
- `NEXT_PUBLIC_ADMIN_USER`=seu_email_admin
- `NEXT_PUBLIC_ADMIN_PASSWORD`=sua_senha_admin
- `NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB`=5 (Tamanho máximo de upload em MB para validação no frontend)
- `UPLOAD_MAX_FILE_SIZE_BYTES`=5242880 (Tamanho máximo de upload em bytes para validação no backend, ex: 5MB)
- `FIREBASE_API_KEY`=sua_chave_api_firebase
- `FIREBASE_AUTH_DOMAIN`=seu_auth_domain_firebase
- `FIREBASE_PROJECT_ID`=seu_project_id_firebase
- `FIREBASE_STORAGE_BUCKET`=seu_storage_bucket_firebase (se usar Firebase Storage para comprovantes)
- `FIREBASE_MESSAGING_SENDER_ID`=seu_messaging_sender_id_firebase
- `FIREBASE_APP_ID`=seu_app_id_firebase
- `FIREBASE_MEASUREMENT_ID`=seu_measurement_id_firebase

Recomendadas:
- `ADMIN_EMAILS`=admin1@dominio.com,admin2@dominio.com
- `DEFAULT_CAMPAIGN_ID`=independencia-2025
- `INVITE_EXP_HOURS`=72
- `MAX_BETS_PER_INVITE`=100
- `LOTOFACIL_MIN_DEZENAS`=15
- `LOTOFACIL_MAX_DEZENAS`=20
- `ENABLE_SINGLE_USE_INVITE`=true

---

## Instalação e Execução (Local)

1.  Clone o repositório:
    -   `git clone <url-do-repositorio>`
    -   `cd facil`
2.  Instale dependências:
    -   `npm install`
3.  Configure o `.env.local` (ver seção anterior).
4.  Rode em desenvolvimento:
    -   `npm run dev`
5.  Acesse:
    -   `http://localhost:3000`

Scripts úteis:
- `npm run dev` — modo desenvolvimento
- `npm run build` — build de produção
- `npm run start` — rodar localmente em produção
- `npm run lint` — lint
- `npm run typecheck` — checagem TypeScript

---

## Fluxos de Uso

Admin:
1.  Acessa `/admin` (restrição por email admin ou token de admin).
2.  Preenche dados do convite:
    -   `campaignId` (default: `DEFAULT_CAMPAIGN_ID`)
    -   `singleUse` (true/false)
    -   validade (horas)
    -   metadados do convidado (nome/email — opcional)
3.  Gera link → copia e envia ao participante.
4.  Acompanha status pelo sistema de dados remoto.

Participante (via link):
1.  Abre o link `/invite/[token]`.
2.  App valida token (assinatura e expiração).
3.  Participante aceita termos de uso.
4.  Participante seleciona de 15 a 20 números (1–25, sem repetição) e define cotas.
5.  Envia → API valida, grava no sistema de dados remoto e retorna confirmação com `apostaId`.
6.  Exibe confirmação e botão “Criar outro jogo” (se permitido).

---

## API (Endpoints)

- `POST /api/admin/invites`
    - Protegido (admin).
    - Body:
        - `campaignId?: string`
        - `singleUse?: boolean`
        - `expDays?: number`
        - `participant?: { name?: string; email?: string }`
    - Resposta:
        - `{ link: string, tokenPreview: string, inviteId: string, exp: number }`

- `POST /api/bets`
    - Público com token de convite válido (enviado em `Authorization: Bearer <token>` ou no body).
    - Body:
        - `token: string` (ou via header)
        - `bets: Bet[]` (array de objetos de aposta, cada um com `id`, `numbers`, `shares`)
        - `comprovante?: string` (Base64 da imagem, se aplicável, ou URL temporária para upload direto)
    - Resposta:
        - `{ transactionId: string, status: "ok", savedAt: string }`

- `POST /api/bets/by-invite-id`
    - Busca apostas de um participante específico.
    - Body: `{ inviteId: string }`
    - Resposta: `{ bets: Bet[] }`

- `POST /api/bets/check-invite-status`
    - Verifica se um convite já foi usado ou possui apostas.
    - Body: `{ token: string }`
    - Resposta: `{ hasBets: boolean }`

- `POST /api/invites/validate`
    - Valida um token de convite.
    - Body: `{ token: string }`
    - Resposta: `{ inviteId: string, campaignId: string, campaignName: string, singleUse: boolean, expiresAt: string, participant?: object, campaignDetails: Campaign }`

- `GET /api/admin/campaigns`
    - Retorna todas as campanhas.

- `POST /api/admin/campaigns`
    - Cria uma nova campanha.

- `GET /api/admin/campaigns/[id]`
    - Retorna uma campanha específica.

- `PUT /api/admin/campaigns/[id]`
    - Atualiza uma campanha específica.

- `DELETE /api/admin/campaigns/[id]`
    - Remove uma campanha.

- `GET /api/admin/config`
    - Retorna as configurações de uma campanha (ou a campanha ativa/padrão).

- `POST /api/admin/config`
    - Atualiza as configurações de uma campanha.

- `GET /api/admin/dashboard`
    - Retorna dados agregados para o dashboard administrativo.

Observações:
- Limite de taxa recomendado (ex.: 5 req/min por IP) para `/api/bets`.
- Logs mínimos: `inviteId`, `campaignId`, `apostaId`, `timestamp`.

---

## Regras de Negócio e Validações

- **Convite**:
    - Assinado (JWT) com payload: `{ inviteId, campaignId, singleUse, exp, participant? }`.
    - Expiração obrigatória.
    - Opcional `singleUse`: após primeiro uso, deve ser marcado como “usado” (pelo menos no sistema de dados remoto ou cache) e negado em novos envios.
- **Aposta**:
    - `numbers`: 15 a 20 dezenas.
    - Cada dezena: inteiro 1–25, sem repetição.
    - `shares`: inteiro >= 1 (limite via `MAX_BETS_PER_INVITE` opcional).
    - `campaignId` do token deve estar “ativa” (definível no sistema de dados remoto Config).
    - Comprovante PIX Obrigatório: O envio da aposta só pode ser concluído se um comprovante PIX válido for anexado. Tipos de arquivo permitidos: Imagens (JPG, PNG). Tamanho máximo do arquivo: 5MB.
- **Persistência**:
    - Inserção de registro no sistema de dados remoto; não sobrescrever para manter trilha de auditoria.
    - Se cancelamento for necessário, inserir novo registro com status = “cancelado” referenciando `apostaId` original.
    - O link ou ID do comprovante no serviço de armazenamento de arquivos em nuvem deve ser persistido na mesma linha da aposta.
- **Auditoria**:
    - Registrar eventos relevantes: criação de convite, uso de convite, criação de aposta, falhas de validação, upload de comprovante.

---

## Segurança

- JWT assinado com chave forte (`JWT_SECRET`).
- Convites com expiração curta (ex.: 72h) e opcionalmente `singleUse`.
- Sanitização de entrada e validação rígida (`zod`).
- Minimizar dados pessoais no token (evitar email no payload; use `inviteId`).
- No sistema de dados remoto, preferir armazenar identificadores em vez de dados sensíveis. Se necessário, ofuscar IP (hash) e não armazenar PII.
- Endpoints admin apenas para `ADMIN_EMAILS` (validados pelo provedor de login ou cabeçalho secreto em ambiente restrito).
- CORS restrito (se exposto fora da mesma origem).
- Não exponha credenciais do serviço de armazenamento em nuvem no cliente. Toda escrita ocorre no servidor.
- Acesso ao serviço de armazenamento em nuvem para upload deve ser feito por credenciais de serviço com permissões restritas apenas à pasta/bucket de comprovantes.
- O link do comprovante no sistema de dados remoto deve ser o mais restritivo possível (se houver autenticação para visualização, melhor).

---

## Deploy na Vercel

1.  Crie um novo projeto e conecte ao repositório Git.
2.  Configure as variáveis de ambiente em Project Settings → Environment Variables.
3.  Defina o framework como Next.js (auto-detect).
4.  Faça o primeiro deploy.
5.  Teste:
    -   POST `/api/admin/invites` (gere um link).
    -   Abra o link e crie uma aposta (confira o sistema de dados remoto).

Dicas:
- Se usar proteção por email admin, integre um provedor simples (por ex., magic link próprio, cabeçalho temporário ou NextAuth, se optar).
- Ative Password Protection no preview se necessário.
- Monitore logs no painel da Vercel.

---

## Testes

- **Unitários**:
    - Validações (`zod`): números, cotas, payload do convite.
    - Regras de negócio (`singleUse`, expiração).
- **Integração**:
    - `/api/bets` com token válido e inválido.
    - Escrita no sistema de dados remoto (usar base de dados de teste).
    - Upload de comprovante para o serviço de armazenamento de arquivos em nuvem.
- **E2E (opcional)**:
    - Playwright/Cypress: fluxo convite → criação de aposta → verificação no sistema de dados remoto (mock).
- **Critérios de aceite (exemplos)**:
    - Convite expirado não permite aposta.
    - Aposta inválida não é salva no sistema de dados remoto.
    - Aposta válida gera um registro na coleção/tabela de apostas, incluindo o link do comprovante.
    - Deve ser possível selecionar um arquivo de imagem (JPG, PNG).
    - Não deve permitir upload de outros tipos de arquivo.
    - Deve rejeitar arquivos maiores que o limite configurado (e.g., 5MB).
    - Deve exibir mensagem de erro clara em caso de arquivo inválido.
    - O arquivo salvo no serviço de armazenamento em nuvem deve corresponder ao arquivo original (hash/tamanho).

Scripts sugeridos:
- `npm test` (jest/vitest opcional)
- `npm run e2e` (opcional)

---

## Observabilidade e Logs

- **Logs de servidor**:
    - Sucesso/erro nas chamadas ao sistema de dados remoto e ao serviço de armazenamento em nuvem.
    - Validação de token (sem expor payload sensível).
    - Geração de convites (`inviteId`, `campaignId`).
    - Monitoramento de falhas no upload de comprovantes.
- (Opcional) `@vercel/analytics` para métricas leves.
- (Opcional) Sentry para rastreio de erros.

Retenção de logs:
- Evitar PII.
- Reduzir nível de detalhe em produção (warnings/erros).

---

## Roadmap

- **MVP**:
    - Convites (admin).
    - Criação de apostas (participante).
    - Escrita no sistema de dados remoto.
    - Upload de comprovantes para o serviço de armazenamento em nuvem.
- **Próximas iterações**:
    - Painel de leitura (leitura do sistema de dados remoto para relatórios simples).
    - Rate limiting nos endpoints públicos.
    - Cancelamento/edição controlados.
    - Exportação CSV em UI admin.
    - Integração com pagamento (ex.: registro do status da cota).
    - Internacionalização (i18n).
    - Testes E2E automatizados.
    - Tematização (dark mode).
- **Recursos futuros (Planejado)**:
    - Testes automatizados (aprofundar).
    - PWA (Progressive Web App).
    - Internacionalização (i18n).
    - Tema escuro/claro.
    - Analytics e métricas.
    - Sistema de notificações.

---

## Licença

MIT — sinta-se livre para usar, adaptar e contribuir.

---

## Dicas Finais

- Mantenha a estrutura de dados organizada: use identificadores e campos de status para facilitar a auditoria.
- Controle de versão das regras (anote mudanças na configuração da campanha).
- Faça backups periódicos dos seus dados.
- Para escalar, considere otimizar o acesso ao sistema de dados remoto ou transicionar para soluções mais robustas conforme a necessidade.