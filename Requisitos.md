# Requisitos do Projeto — Plataforma Web de Apostas (Loto Fácil da Independência)

## Sumário
1. Visão Geral
2. Escopo
3. Stakeholders e Perfis
4. Requisitos Funcionais (RF)
5. Requisitos Não Funcionais (RNF)
6. Regras de Negócio (RN)
7. Fluxos do Usuário
8. Modelo de Dados (conceitual)
9. Integração com Google Sheets
10. **NOVO: Integração com Google Drive**
11. Arquitetura e Stack Técnica
12. Segurança e Conformidade
13. Implantação (Vercel) e Variáveis de Ambiente
14. Testes e Critérios de Aceite
15. Monitoramento e Observabilidade
16. Roadmap e Melhorias Futuras
17. Riscos e Mitigações

---

## 1. Visão Geral
- Objetivo: Criar uma aplicação web responsiva para convites privados onde participantes selecionam números para apostas da Loto Fácil da Independência. Cada participante pode registrar quantas cotas desejar. Os jogos devem ser salvos em uma planilha do Google (Google Sheets) e **os comprovantes de pagamento (imagens) devem ser armazenados no Google Drive.**
- Diretriz de simplicidade: Projeto simples, prático, com hospedagem na Vercel e uso de frameworks consolidados.

---

## 2. Escopo

### 2.1. Escopo Incluído
- Geração de links de acesso individuais pelo administrador (convites).
- Acesso dos participantes via link único e seguro (sem cadastro tradicional).
- Seleção de números conforme regras da Loto Fácil (15 a 20 números do conjunto 1–25).
- Registro de quantidade de cotas por jogo (participante pode criar múltiplos jogos/cotas).
- Persistência dos jogos em uma planilha online do Google (Google Sheets).
- **NOVO: Armazenamento do comprovante PIX (imagem) no Google Drive, vinculado ao registro da aposta na planilha.**
- Painel simples para o administrador acompanhar envios, status dos convites, estatísticas básicas.
- Responsividade (mobile-first).
- Hospedagem e CI/CD na Vercel.

### 2.2. Fora do Escopo (neste MVP)
- Pagamentos online (exceto o upload do comprovante).
- Sorteio, conferência de resultados automática ou integração com loterias.
- Sistema de autenticação clássico com senha/2FA (substituído por link seguro).
- App nativo mobile.
- Multi-idioma (PT-BR apenas no MVP).

---

## 4. Requisitos Funcionais (RF)

- RF-01: Criar Campanha (mantido)
- RF-02: Gerar Convites (mantido)
- RF-03: Entregar Link de Acesso (mantido)
- RF-04: Autenticação por Link Seguro (Magic Link/Token Assinado) (mantido)
- RF-05: Aceite de Termos (mantido)
- RF-06: Seleção de Números (mantido)
- RF-07: Gestão de Cotas (mantido)
- RF-08: Revisão e Confirmação (mantido)
- RF-09: Persistência no Google Sheets (mantido)
- **RF-10: Anexar Comprovante PIX**
    - Participante deve ser capaz de fazer upload de um arquivo de imagem (JPG, PNG) como comprovante PIX antes de enviar a aposta.
    - O sistema deve validar o tipo e o tamanho do arquivo (e.g., máx. 5MB).
- **RF-11: Armazenamento de Comprovante no Google Drive**
    - A imagem do comprovante deve ser enviada e armazenada em uma pasta específica no Google Drive.
    - O nome do arquivo no Drive deve ser padronizado (e.g., `comprovante_[transactionId].jpg/png`).
    - Após o upload, o link direto ou ID do arquivo no Google Drive deve ser salvo na planilha de apostas.
- RF-12: Evitar Duplicidade de Envio (mantido, agora incluindo o comprovante)
- RF-13: Painel do ADM (mantido)
- RF-14: Exportação (mantido)
- RF-15: Edição/Cancelamento (opcional por configuração da campanha) (mantido)
- RF-16: Auditoria Básica (mantido, incluindo logs de upload de comprovante)
- RF-17: Acessibilidade (mantido)
- RF-18: Responsividade (mantido)

---

## 5. Requisitos Não Funcionais (RNF)

- RNF-01: Hospedagem na Vercel com build automático a partir do repositório Git. (mantido)
- RNF-02: Disponibilidade alvo ≥ 99% (melhor esforço, sem SLA formal no MVP). (mantido)
- RNF-03: Desempenho (mantido)
    - Páginas principais com TTFB baixo em regiões suportadas pela Vercel.
    - Uso de renderização serverless e cache leve onde aplicável.
    - **Upload de comprovante deve ser rápido (max. 5 segundos para arquivos de até 1MB em boa conexão).**
- RNF-04: Segurança (mantido)
    - HTTPS, tokens assinados (JWT/crypto), expirados e, quando configurado, de uso único.
    - Rate limiting em rotas sensíveis.
    - **Acesso ao Google Drive para upload deve ser feito por Service Account com permissões restritas apenas à pasta de comprovantes.**
    - **Dados sensíveis (chaves de API, credenciais) não devem ser expostos no cliente.**
- RNF-05: Privacidade e LGPD (mantido)
    - Coleta mínima de dados pessoais (nome ou apelido opcional). Consentimento explícito.
    - Meios para remoção/anonimização de dados sob solicitação do participante.
    - **Imagens de comprovante não devem conter PII além do necessário para validação do pagamento.**
- RNF-06: Observabilidade (mantido)
    - Logs de aplicação e erros, com IDs de correlação.
    - **Monitoramento de falhas no upload para Google Drive.**
- RNF-07: Manutenibilidade (mantido)
    - Código modular, tipado (TypeScript), padrões de lint e formatação.
- RNF-08: UX (mantido)
    - Fluxo direto, poucas etapas, feedback claro de erros/sucessos.

---

## 6. Regras de Negócio (RN)

- RN-01: Formato da Loto Fácil (mantido)
- RN-02: Cotas (mantido)
- RN-03: Validade dos Convites (mantido)
- RN-04: Janela da Campanha (mantido)
- RN-05: Unicidade dos Números no Jogo (mantido)
- RN-06: Preço da Cota (Parâmetro) (mantido)
- RN-07: Edição (mantido)
- RN-08: Integridade na Planilha (mantido)
    - Cada submissão gera linha única com ID imutável. Sem sobrescrita de registros existentes.
    - **O link ou ID do comprovante no Google Drive deve ser persistido na mesma linha da aposta.**
- **RN-09: Comprovante PIX Obrigatório**
    - O envio da aposta só pode ser concluído se um comprovante PIX válido for anexado.
    - Tipos de arquivo permitidos: Imagens (JPG, PNG).
    - Tamanho máximo do arquivo: 5MB.
- RN-10: Limites (Opcional) (mantido)

---

## 7. Fluxos do Usuário

### 7.2. Fluxo do Participante
1. Participante clica no link recebido.
2. Sistema valida token (assinatura, expiração, uso único se aplicável).
3. Participante aceita termos de uso.
4. Participante seleciona números (15–20 dentre 1–25), informa cotas, e adiciona mais jogos se desejar.
5. Participante revisa os jogos e **anexa o comprovante PIX (imagem)**.
6. Participante confirma.
7. Sistema **salva o comprovante no Google Drive**, salva os dados da aposta no Google Sheets e exibe confirmação.
8. Se edição estiver habilitada e dentro do prazo, participante pode ajustar/cancelar jogos.

### 7.3. Fluxo de Erro
- Link inválido/expirado: exibir mensagem e instruir contato com ADM.
- Falha no Google Sheets: tentar novamente (exponencial backoff) e, se persistir, registrar erro e sugerir tentar mais tarde.
- **NOVO: Falha no upload do comprovante PIX (arquivo inválido, erro de comunicação com Google Drive): exibir mensagem de erro específica e instruir o usuário a tentar novamente ou verificar o arquivo.**

---

## 8. Modelo de Dados (Conceitual)

Entidades principais:

- Campaign (mantido)
- Invite (mantido)
- ParticipantSession (mantido)
- Bet (mantido)
    - id, campaignId, inviteId, participantSessionId, numbers (array de int 1..25), shares (int > 0), createdAt, updatedAt?, status (active|cancelled)
    - **NOVO: proofImageUrl (string: URL ou ID do arquivo no Google Drive)**
- AuditLog (mantido)

---

## 9. Integração com Google Sheets

### 9.1. Estrutura da Planilha
- Aba: "bets"
    - Columns:
      - id (string UUID)
      - campaign_id (string)
      - invite_id (string)
      - participant_session_id (string)
      - numbers (string no formato “01,02,...,25” ordenados)
      - shares (int)
      - status (active|cancelled)
      - created_at (ISO)
      - updated_at (ISO)
      - ip (string)
      - user_agent (string)
      - **NOVO: comprovante_url (string: URL pública ou ID do arquivo no Google Drive)**
- Aba: "invites" (opcional para espelhar no Sheets) (mantido)
- Aba: "campaigns" (opcional) (mantido)

### 9.2. Autenticação (mantido)
- Service Account no Google Cloud com acesso à Sheets API.
- Compartilhar a planilha com o e-mail da Service Account (Editor).

### 9.3. Operações (mantido)
- Inserção: append por linha, nunca sobrescrever.
- Leitura: leitura paginada para o painel (ou usar cache no DB para o painel).
- Resiliência: retry com backoff em 429/5xx, rate limiting local.

---

## 10. Integração com Google Drive (NOVA SEÇÃO)

### 10.1. Propósito
- Armazenar de forma segura e organizada os comprovantes PIX enviados pelos participantes.

### 10.2. Autenticação
- A mesma Service Account utilizada para o Google Sheets pode ser utilizada para o Google Drive.
- A Service Account deve ter permissão de `Editor` na pasta específica onde os comprovantes serão salvos.

### 10.3. Estrutura de Armazenamento
- Recomenda-se criar uma pasta dedicada no Google Drive (e.g., `facil-comprovantes-pix`) para isolar os arquivos.
- Os arquivos serão salvos com nomes padronizados (e.g., `[transactionId]_comprovante.[extensao]`).

### 10.4. Operações
- **Upload:** Enviar o arquivo de imagem (Base64 ou Buffer) para a pasta configurada no Google Drive.
- **Obtenção de URL:** Recuperar o link de visualização ou download do arquivo após o upload para armazenamento na planilha.

---

## 11. Arquitetura e Stack Técnica (antiga 10)

### 11.1. Stack
- Frontend/Fullstack: Next.js (App Router) + React + TypeScript
- UI: Tailwind CSS (+ opcional shadcn/ui para componentes)
- Auth por link: JWT assinado e curto (ou NextAuth e-mail se desejar fluxo por e-mail)
- Backend: Rotas serverless do Next.js (Route Handlers /app/api)
- DB: Vercel Postgres/Neon (recomendado) + Prisma
- Integração Sheets: googleapis (Google Sheets API v4)
- **NOVO: Integração Drive: googleapis (Google Drive API v3)**
- Deploy: Vercel

### 11.2. Padrões
- SSR/SSG conforme necessidade; pages sensíveis via SSR com validação do token.
- Validations com Zod (inputs e payloads).
- Idempotência via chave de requisição (nonce) e constraints de DB.
- **Upload de arquivo: Utilizar API Route para receber o arquivo, processá-lo no backend e fazer o upload para o Google Drive antes de registrar a aposta.**

---

## 12. Segurança e Conformidade (antiga 11)

- Links de convite: (mantido)
- Rate limiting: (mantido)
- CSRF: (mantido)
- XSS: (mantido)
- LGPD: (mantido)
- **NOVO: Acesso ao Google Drive:**
    - A Service Account deve ter o mínimo de permissões necessárias (apenas escrita na pasta de comprovantes).
    - O `GOOGLE_SERVICE_ACCOUNT_KEY` não deve ser exposto no cliente.
    - O link do comprovante na planilha deve ser o mais restritivo possível (se houver autenticação para visualização, melhor).

---

## 13. Implantação (Vercel) e Variáveis de Ambiente (antiga 12)

### 13.1. Passos de Deploy (mantido, com adição do Drive)
1. Criar projeto no repositório (GitHub/GitLab/Bitbucket).
2. Configurar o projeto na Vercel e conectar o repositório.
3. Criar Service Account no Google Cloud, habilitar Google Sheets API **e Google Drive API**, baixar JSON de credenciais.
4. Criar a planilha no Google Drive e compartilhar com o e-mail da Service Account (Editor).
5. **NOVO: Criar uma pasta específica no Google Drive para os comprovantes e compartilhar essa pasta com o e-mail da Service Account (Editor). Obter o ID desta pasta.**
6. Definir variáveis de ambiente na Vercel: (atualizado abaixo)
7. Realizar o primeiro deploy e testar.

### 13.2. Variáveis de Ambiente (exemplo) (atualizado)
- GOOGLE_SHEETS_SPREADSHEET_ID (mantido)
- GOOGLE_SERVICE_ACCOUNT_EMAIL (mantido)
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (mantido)
- JWT_SECRET (mantido)
- DATABASE_URL (mantido)
- **NOVO: GOOGLE_DRIVE_RECEIPTS_FOLDER_ID=seu_id_da_pasta_comprovantes**
- **NOVO: NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB=5 (opcional, para validação no frontend)**

---

## 14. Testes e Critérios de Aceite (antiga 13)

### 14.1. Testes Funcionais (mantido, com adição do Drive)
- Convite: (mantido)
- Seleção de números: (mantido)
- Cotas: (mantido)
- **NOVO: Anexo de Comprovante:**
    - Deve ser possível selecionar um arquivo de imagem (JPG, PNG).
    - Não deve permitir upload de outros tipos de arquivo.
    - Deve rejeitar arquivos maiores que o limite configurado (e.g., 5MB).
    - Deve exibir mensagem de erro clara em caso de arquivo inválido.
- Submissão:
    - Salvar no Google Sheets, verificar linha criada com todos os campos.
    - **Verificar se o comprovante foi salvo na pasta correta do Google Drive e se o link/ID foi corretamente gravado na planilha.**
    - Exibir confirmação com ID do jogo.
- Painel ADM: (mantido)
- Exportar CSV sem corromper acentuação. (mantido)

### 14.2. Testes Não Funcionais (mantido, com adição do Drive)
- Responsividade: (mantido)
- Performance: (mantido)
- Segurança: (mantido)
- **NOVO: Integridade do Upload:**
    - Verificar se o arquivo salvo no Google Drive corresponde ao arquivo original (hash/tamanho).
    - Testar upload de arquivos grandes (próximos ao limite) e pequenos.

### 14.3. Critérios de Aceite (mantido, com adição do Drive)
- Um participante com link válido consegue enviar pelo menos um jogo com 15 a 20 números e cotas > 0 **e um comprovante PIX (imagem válida).**
- Os jogos enviados aparecem na planilha com dados corretos e ID único, **incluindo o link do comprovante.**
- ADM consegue ver no painel o total de jogos/cotas por campanha.
- Links inválidos/expirados mostram mensagem adequada.
- Layout responsivo e utilizável em mobile.

---