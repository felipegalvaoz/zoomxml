# 📁 Organização dos Componentes

## ✅ **Estrutura Organizada e Limpa**

Os componentes foram organizados em pastas lógicas sem arquivos auxiliares (index, aliases, etc.).

## 🗂️ **Nova Estrutura**

```
frontend/components/
├── auth/                    # Componentes de Autenticação
│   ├── auth-guard.tsx      # Proteção de rotas
│   └── login-form.tsx      # Formulário de login
│
├── dashboard/              # Componentes do Dashboard
│   ├── dashboard-content.tsx
│   └── dashboard-stats.tsx
│
├── forms/                  # Formulários Específicos
│   └── credential-form.tsx # Formulário de credenciais
│
├── layout/                 # Componentes de Layout
│   ├── app-sidebar.tsx     # Sidebar principal
│   ├── nav-main.tsx        # Navegação principal
│   ├── nav-projects.tsx    # Navegação de projetos
│   ├── nav-user.tsx        # Menu do usuário
│   └── team-switcher.tsx   # Seletor de equipe
│
├── pages/                  # Conteúdo das Páginas
│   ├── audit-content.tsx   # Página de auditoria
│   ├── companies-content.tsx # Lista de empresas
│   ├── documents-content.tsx # Documentos
│   ├── members-content.tsx   # Membros
│   └── users-content.tsx     # Usuários
│
├── providers/              # Providers (Context, Theme, etc.)
│   └── theme-provider.tsx  # Provider de tema
│
└── ui/                     # Componentes UI (shadcn/ui)
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── table.tsx
    └── ... (outros componentes UI)
```

## 📝 **Como Importar**

### **Imports Diretos (Recomendado)**
```typescript
// Auth
import { AuthGuard } from '@/components/auth/auth-guard'
import { LoginForm } from '@/components/auth/login-form'

// Dashboard
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'

// Forms
import { CredentialForm } from '@/components/forms/credential-form'

// Layout
import { AppSidebar } from '@/components/layout/app-sidebar'
import { NavMain } from '@/components/layout/nav-main'

// Pages
import { CompaniesContent } from '@/components/pages/companies-content'
import { UsersContent } from '@/components/pages/users-content'

// Providers
import { ThemeProvider } from '@/components/providers/theme-provider'

// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
```

## 🎯 **Vantagens desta Organização**

### **✅ Clareza**
- Cada pasta tem um propósito específico
- Fácil de encontrar componentes
- Estrutura intuitiva

### **✅ Manutenibilidade**
- Componentes relacionados ficam juntos
- Fácil de adicionar novos componentes
- Reduz conflitos de nomes

### **✅ Escalabilidade**
- Estrutura preparada para crescimento
- Fácil de dividir responsabilidades
- Permite refatoração gradual

### **✅ Sem Complexidade**
- Sem arquivos index desnecessários
- Sem aliases confusos
- Imports diretos e claros

## 🔄 **Próximos Passos**

1. **Atualizar Imports**: Usar os novos caminhos nos arquivos existentes
2. **Novos Componentes**: Seguir a estrutura organizada
3. **Documentação**: Manter este padrão para novos desenvolvedores

## 📋 **Convenções**

- **Nomes de Pastas**: kebab-case (auth, dashboard, etc.)
- **Nomes de Arquivos**: kebab-case.tsx
- **Exports**: Named exports preferencialmente
- **Imports**: Sempre usar caminhos absolutos com @/
