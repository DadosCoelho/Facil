# Participante (Essenciais)

## 1) Página de Convite (Acesso via Link)
**Rota:** `/i/[token]`  
**Objetivo:** Validar o convite e liberar o participante para criar apostas na campanha ativa.

### Elementos
- Cabeçalho simples com nome/branding da campanha (ex.: *“Facil”*).
- Card com informações da campanha: nome, período, regras resumidas (ex.: *“15 números por jogo, cotas ilimitadas”*).
- Campo opcional de identificação leve (nome ou e-mail) se a campanha exigir.
- Checkbox de aceite dos termos (com link para `/termos`).
- Botão **“Começar”**.

### Ações
- Validar token (assinatura e expiração).
- Registrar sessão do participante.
- Redirecionar para criação de aposta.

### Validações/Estados
- Token inválido/expirado → mensagem + CTA **“Falar com o organizador”**.
- Campanha fechada → mensagem *“Campanha encerrada”*.
- Falha de rede → tentar novamente.

### Responsividade
- Layout em coluna.
- CTA fixo no rodapé no mobile.

---

## 2) Criação de Aposta (Seleção de Números e Cotas)
**Rota:** `/aposta/nova`  
**Objetivo:** Selecionar 15 números (1–25), definir número de cotas e adicionar ao resumo.

### Elementos
- Grade 5x5 dos números 01–25 com estados: normal, selecionado, bloqueado.
- Contador de números selecionados (ex.: *“15/15”*).
- Seletor de cotas (input numérico + botões +/-).
- Ações rápidas: **“Surpresinha”** (random), **“Limpar tudo”**.
- Botão **“Adicionar ao resumo”**.

### Ações
- Selecionar/desmarcar números (máx. 15).
- Definir cotas (mín. 1; máx. opcional).
- Adicionar jogo ao resumo (buffer local) ou enviar direto.

### Validações
- Impedir mais de 15 números.
- Alertar se menos de 15.
- Cotas válidas (≥1).

### Estados
- Empty state (nenhum número selecionado ainda).
- Erro de validação (mensagens curtas e claras).

### Responsividade
- Botões grandes.
- Grade com toque confortável (48px).

---

## 3) Resumo e Envio (Revisão dos Jogos)
**Rota:** `/aposta/revisao`  
**Objetivo:** Revisar jogos adicionados, remover/duplicar e enviar.

### Elementos
- Lista de “cards” de jogos com: sequência de 15 números, cotas, ações **“Remover”** e **“Duplicar”**.
- Contador total de jogos e cotas.
- Botão principal **“Enviar aposta(s)”**.

### Ações
- Remover/duplicar jogo.
- Enviar todos para persistência (Sheets + log).

### Validações
- Não deixar enviar vazio.
- Confirmar envio irreversível (se definido pela regra).

### Estados
- Sem jogos no resumo → CTA **“Criar novo jogo”**.
- Busy state ao enviar (loading).

### Responsividade
- Cards empilhados.
- CTA fixo no rodapé no mobile.

---

## 4) Confirmação/Recibo
**Rota:** `/aposta/confirmacao/[id]`  
**Objetivo:** Confirmar que as apostas foram registradas.

### Elementos
- Mensagem de sucesso.
- Lista dos jogos enviados com IDs (ou hash) e data/hora.
- Link **“Ver minhas apostas”**.

### Ações
- Copiar ID/recibo.
- Ir para **“Minhas apostas”**.

### Estados
- Falha no pós-processamento → retry de leitura, sem duplicar envio.

---

## 5) Minhas Apostas
**Rota:** `/minhas-apostas`  
**Objetivo:** Exibir todas as apostas do participante.

### Elementos
- Lista de apostas com: data, números, cotas, status (ex.: *“enviada”*).
- Filtros simples (por data/status).
- Ação **“Duplicar”**.
- Se previsto: **“Cancelar”** dentro de janela configurável.

### Estados
- Empty state → CTA **“Criar primeira aposta”**.
- Paginação/infinite scroll se necessário.

---

# Admin (Essenciais)

## 6) Login/Admin Gate
**Rota:** `/admin/login` (ou magic link)  
**Objetivo:** Restringir o painel a administradores.

### Elementos
- Login minimalista (e-mail + OTP ou senha).
- Mensagens de erro claras.

---

## 7) Dashboard (Painel)
**Rota:** `/admin`  
**Objetivo:** Visão geral rápida da campanha ativa.

### Elementos
- Cards: total de apostas, total de cotas, participantes ativos, últimos envios.
- Mini-lista de “últimas 10 apostas”.
- Indicador de status da integração com Google Sheets.

### Ações
- Acessar campanhas, convites, apostas, configurações.

---

## 8) Campanhas (CRUD)
**Rota:** `/admin/campanhas`  
**Objetivo:** Criar/editar/encerrar campanhas.

### Elementos
- Listagem de campanhas (ativa, futuras, encerradas).
- Formulário: nome, descrição, período, limites, regras textuais.
- Campo *Spreadsheet ID* e aba do Sheets.

### Ações
- Criar, ativar, pausar, encerrar.
- Duplicar campanha.

### Validações
- Datas coerentes.
- Bloquear alterações críticas após envios (se regra exigir).

---

## 9) Convites (Gerar e Gerenciar)
**Rota:** `/admin/convites`  
**Objetivo:** Gerar links de acesso.

### Elementos
- Botão **“Gerar convite”** (single-use ou multi-use, validade, nota interna).
- Importação em lote via CSV.
- Tabela de convites: status, criado em, últimas aberturas.

### Ações
- Revogar.
- Copiar link.

---

## 10) Apostas (Admin)
**Rota:** `/admin/apostas`  
**Objetivo:** Acompanhar apostas registradas.

### Elementos
- Filtros: campanha, participante, data, status.
- Tabela: ID, data/hora, números, cotas, origem, status de sync com Sheets.
- Botões: **Exportar CSV**, **Re-sincronizar com Sheets**.

---

## 11) Configurações
**Rota:** `/admin/configuracoes`  
**Objetivo:** Definições globais.

### Seções
- **Google Sheets:** Spreadsheet ID, abas, teste de conexão, credenciais.  
- **Branding:** nome, cores, favicon, logo.  
- **Segurança:** política de convites, janela de cancelamento.  
- **E-mail:** remetente, template de convite.

---

# Telas de Sistema e Suporte (Recomendadas)

## 12) Termos e Privacidade
**Rotas:** `/termos`, `/privacidade`  
**Objetivo:** Base legal e transparência.

---

## 13) Ajuda/FAQ e Contato
**Rota:** `/ajuda`  
**Objetivo:** Reduzir suporte reativo.

---

## 14) Páginas de Erro
**Rotas:** `/404`, `/500`, `/acesso-negado`  
**Objetivo:** Mensagens claras e caminhos de retorno.

---

# Opcionais (Fase 2)

## 15) Auditoria e Logs
**Rota:** `/admin/auditoria`  
**Objetivo:** Rastrear ações relevantes.

---

## 16) Resultados e Conferência
**Rota:** `/resultados`  
**Objetivo:** Registrar resultados oficiais e destacar acertos.

---

## 17) Perfil do Participante
**Rota:** `/perfil`  
**Objetivo:** Atualizar nome/e-mail.

---

# Componentes-chave (Reutilizáveis)
- **GradeNumeros**: grade 5x5 (1–25) com estados.  
- **SeletorCotas**: input com botões de incremento.  
- **CardJogo**: exibe combinação + cotas + ações.  
- **BarraAcoesMobile**: CTA fixo no rodapé.  
- **ModalConfirmacao**: confirma envio/cancelamento.  
- **AlertaIntegracao**: status do Google Sheets.  
- **TabelaApostas**: listagem com filtros e exportação.  
- **Toast/Feedback**: sucessos e erros.  

---

# Rotas sugeridas (Resumo)

### Participante
- `/i/[token]`  
- `/aposta/nova`  
- `/aposta/revisao`  
- `/aposta/confirmacao/[id]`  
- `/minhas-apostas`  
- `/termos`, `/privacidade`, `/ajuda`  

### Admin
- `/admin/login`  
- `/admin`  
- `/admin/campanhas`  
- `/admin/convites`  
- `/admin/apostas`  
- `/admin/configuracoes`  
- `/admin/auditoria` (opcional)  

### Sistema
- `/404`, `/500`, `/acesso-negado`

---

# MVP Mínimo Recomendado

### Participante
- `/i/[token]`  
- `/aposta/nova`  
- `/aposta/revisao`  
- `/aposta/confirmacao/[id]`  
- `/minhas-apostas`  

### Admin
- `/admin` (com autenticação simples)  
- `/admin/convites`  
- `/admin/apostas`  
- `/admin/configuracoes`  

### Sistema
- `/404`, `/500`, `/termos`  

✅ Com esse conjunto você já entrega:
- Convite individual controlado  
- Criação de jogos com cotas  
- Registro em Google Sheets  
- Acompanhamento básico por admin  
- Fluxo seguro para deploy (ex.: Vercel)  
