# Estrutura do Projeto Facil - Organizada

## Visão Geral da Organização

O projeto Facil foi reorganizado seguindo as melhores práticas do Next.js 14 com App Router, criando uma estrutura moderna, escalável e bem organizada.

## 📁 Estrutura de Diretórios

```
facil/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principal da aplicação
│   ├── page.tsx                 # Página inicial (landing)
│   ├── globals.css              # Estilos globais e Tailwind CSS
│   ├── invite/                  # Área de convites (participantes)
│   │   └── [token]/
│   │       └── page.tsx         # Validação de convite
│   ├── aposta/                  # Área de apostas (participantes)
│   │   ├── nova/
│   │   │   └── page.tsx         # Criação de apostas
│   │   ├── revisao/
│   │   │   └── page.tsx         # Revisão e envio
│   │   └── confirmacao/
│   │       └── [id]/
│   │           └── page.tsx     # Confirmação de envio
│   ├── minhas-apostas/
│   │   └── page.tsx             # Visualização das apostas
│   ├── admin/                   # Área administrativa
│   │   ├── login/
│   │   │   └── page.tsx         # Login de administradores
│   │   └── page.tsx             # Dashboard administrativo
│   ├── termos/
│   │   └── page.tsx             # Termos de uso
│   └── privacidade/
│       └── page.tsx             # Política de privacidade
├── components/                   # Componentes reutilizáveis (futuro)
├── lib/                         # Utilitários e configurações (futuro)
├── types/                       # Definições de tipos TypeScript (futuro)
├── public/                      # Arquivos estáticos (futuro)
├── package.json                 # Dependências do projeto
├── next.config.js               # Configuração do Next.js
├── tailwind.config.js           # Configuração do Tailwind CSS
├── postcss.config.js            # Configuração do PostCSS
├── tsconfig.json                # Configuração do TypeScript
├── README.md                    # Documentação principal
├── Requisitos.md                # Requisitos do projeto
├── Paginas.md                   # Especificação das páginas
└── ESTRUTURA_PROJETO.md         # Este arquivo
```

## 🚀 Tecnologias e Stack

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos

### Backend (Futuro)
- **Next.js API Routes** - APIs serverless
- **Google Sheets API** - Integração com planilhas
- **JWT** - Autenticação e autorização
- **Zod** - Validação de dados

### Deploy
- **Vercel** - Plataforma de hospedagem serverless

## 🔗 Fluxo de Navegação

### Participantes
```
1. Acesso via convite: /invite/[token]
2. Criação de apostas: /aposta/nova
3. Revisão e envio: /aposta/revisao
4. Confirmação: /aposta/confirmacao/[id]
5. Visualização: /minhas-apostas
```

### Administradores
```
1. Login: /admin/login
2. Dashboard: /admin
3. Gestão de convites: /admin/convites (futuro)
4. Visualização de apostas: /admin/apostas (futuro)
5. Configurações: /admin/configuracoes (futuro)
```

### Sistema
```
1. Página inicial: /
2. Termos de uso: /termos
3. Política de privacidade: /privacidade
```

## 🎨 Design System

### Cores
- **Primary**: `#6ee7b7` (verde)
- **Background**: `#0b0c10` (escuro)
- **Card**: `#14161d` (cinza escuro)
- **Border**: `#262a37` (cinza médio)
- **Text**: `#e6e8ef` (branco suave)
- **Muted**: `#a9afc3` (cinza claro)

### Componentes Base
- **Botões**: `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`
- **Cards**: `.card` com gradientes e sombras
- **Badges**: `.badge` com variantes `.ok`, `.warn`, `.err`
- **Formulários**: Inputs com foco e validação visual

### Responsividade
- **Mobile-first** design
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid system** flexível com Tailwind CSS

## 🔐 Sistema de Autenticação

### Participantes
- **Token JWT** via convite único
- **Sessão** armazenada no `sessionStorage`
- **Validação** automática em todas as páginas protegidas

### Administradores
- **Login** com email e senha
- **Token JWT** para sessão administrativa
- **Proteção** de rotas administrativas

## 📱 Funcionalidades Implementadas

### ✅ Concluído
- [x] Estrutura base Next.js 14
- [x] Página inicial responsiva
- [x] Sistema de convites (validação)
- [x] Criação de apostas (seleção de números)
- [x] Revisão e envio de apostas
- [x] Confirmação de transações
- [x] Visualização de apostas do participante
- [x] Login administrativo
- [x] Dashboard administrativo
- [x] Páginas de termos e privacidade
- [x] Design system consistente
- [x] Navegação responsiva

### 🚧 Em Desenvolvimento
- [ ] APIs backend (Next.js API Routes)
- [ ] Integração com Google Sheets
- [ ] Sistema de convites administrativo
- [ ] Gestão de campanhas
- [ ] Relatórios e exportação
- [ ] Componentes reutilizáveis

### 📋 Planejado
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)
- [ ] Tema escuro/claro
- [ ] Analytics e métricas
- [ ] Sistema de notificações

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd facil

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção local
npm run start
```

### Variáveis de Ambiente
Criar arquivo `.env.local`:
```env
# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_da_planilha
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# App
APP_URL=http://localhost:3000
```

## 📊 Estrutura de Dados

### Apostas (Bets)
```typescript
interface Bet {
  id: string
  numbers: number[]        // 15-20 números (1-25)
  shares: number           // Quantidade de cotas
  createdAt: string        // Data de criação
  status: 'active' | 'cancelled'
}
```

### Convites (Invites)
```typescript
interface Invite {
  token: string            // JWT assinado
  campaignId: string       // ID da campanha
  expiresAt: string        // Data de expiração
  singleUse: boolean       // Uso único
  participant?: {
    name?: string
    email?: string
  }
}
```

### Campanhas (Campaigns)
```typescript
interface Campaign {
  id: string
  name: string             // Nome da campanha
  description: string      // Descrição
  opensAt: string         // Data de abertura
  closesAt: string        // Data de fechamento
  status: 'active' | 'paused' | 'ended'
}
```

## 🔧 Configurações

### Tailwind CSS
- **Customização** de cores e variáveis CSS
- **Componentes** base pré-definidos
- **Responsividade** integrada

### TypeScript
- **Strict mode** habilitado
- **Path mapping** para imports limpos
- **Types** organizados por funcionalidade

### Next.js
- **App Router** habilitado
- **Server Components** por padrão
- **Client Components** quando necessário

## 📈 Próximos Passos

### Curto Prazo (1-2 semanas)
1. Implementar APIs backend
2. Integração com Google Sheets
3. Sistema de convites administrativo
4. Testes básicos

### Médio Prazo (1-2 meses)
1. Componentes reutilizáveis
2. Sistema de campanhas
3. Relatórios e exportação
4. Melhorias de UX

### Longo Prazo (3+ meses)
1. PWA e funcionalidades offline
2. Sistema de pagamentos
3. Analytics avançados
4. Multi-idioma

## 🤝 Contribuição

### Padrões de Código
- **ESLint** + **Prettier** para formatação
- **TypeScript** para tipagem
- **Conventional Commits** para mensagens
- **Component-first** architecture

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## 📞 Suporte

Para dúvidas ou suporte:
1. Verificar a documentação
2. Abrir uma issue no repositório
3. Contatar a equipe de desenvolvimento

---

**Facil** - Plataforma de Gestão de Apostas da Lotofácil da Independência

*Última atualização: Dezembro 2024*
