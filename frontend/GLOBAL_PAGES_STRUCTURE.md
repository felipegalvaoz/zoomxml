# 🌐 Páginas Globais - ZoomXML

## ✅ **Estrutura Dual de Navegação**

Implementamos uma estrutura dual que oferece máxima flexibilidade:
- **Navegação Contextual**: Por empresa específica
- **Navegação Global**: Visão centralizada de todos os dados

## 🗂️ **Estrutura Completa**

### **📁 Rotas Implementadas**
```
frontend/app/
├── dashboard/page.tsx              # Dashboard principal
├── companies/
│   ├── page.tsx                   # Lista de empresas
│   └── [id]/                      # Rotas contextuais por empresa
│       ├── credentials/page.tsx   # Credenciais da empresa X
│       ├── members/page.tsx       # Membros da empresa X
│       └── documents/page.tsx     # Documentos da empresa X
├── credentials/page.tsx           # 🌐 TODAS as credenciais
├── documents/page.tsx             # 🌐 TODOS os documentos
├── members/page.tsx               # 🌐 TODOS os membros
├── users/page.tsx                 # Gestão de usuários
└── audit/page.tsx                 # Logs de auditoria
```

### **🌐 URLs Resultantes**
```
# Navegação Global
/credentials                       # Todas as credenciais
/documents                         # Todos os documentos  
/members                          # Todos os membros

# Navegação Contextual
/companies/123/credentials         # Credenciais da empresa 123
/companies/123/members            # Membros da empresa 123
/companies/123/documents          # Documentos da empresa 123
```

## 🎯 **Fluxos de Navegação**

### **1. Sidebar Atualizada**
```
📊 Dashboard
🏢 Empresas
🔑 Credenciais (Global)
📄 Documentos (Global)
👥 Membros (Global)
👤 Usuários
🔍 Auditoria
```

### **2. Fluxo Global**
```
1. Usuário clica em "Credenciais" no sidebar
2. Vê TODAS as credenciais de TODAS as empresas
3. Pode filtrar por empresa específica
4. Pode adicionar nova credencial escolhendo a empresa
5. Gerencia tudo em um só lugar
```

### **3. Fluxo Contextual**
```
1. Usuário clica em "Empresas" no sidebar
2. Vê lista de empresas
3. Clica em botão "Credenciais" de uma empresa
4. Vê apenas credenciais daquela empresa
5. Contexto sempre preservado
```

## 🎨 **Funcionalidades das Páginas Globais**

### **🔑 Credenciais Globais (/credentials)**

#### **Recursos Implementados:**
- ✅ **Tabela Unificada**: Todas as credenciais em uma só view
- ✅ **Coluna Empresa**: Mostra empresa + CNPJ para cada credencial
- ✅ **Filtros Avançados**:
  - Por empresa (dropdown com todas as empresas)
  - Por tipo (Usuário/Senha, Token, Misto)
  - Por ambiente (Produção, Homologação, Desenvolvimento)
  - Por status (Ativo/Inativo)
- ✅ **Busca**: Por nome ou descrição da credencial
- ✅ **Ações**: Editar, visualizar, excluir
- ✅ **Botão "Nova Credencial"**: Com seleção de empresa

#### **Interface:**
```typescript
interface GlobalCredential {
  id: number
  company_id: number
  type: string
  name: string
  description?: string
  login?: string
  environment?: string
  active: boolean
  created_at: string
  company: {
    id: number
    name: string
    cnpj: string
  }
}
```

### **📄 Documentos Globais (/documents)**

#### **Recursos Implementados:**
- ✅ **Tabela Unificada**: Todos os documentos em uma só view
- ✅ **Coluna Empresa**: Mostra empresa + CNPJ para cada documento
- ✅ **Filtros Robustos**:
  - Por empresa
  - Por status (Pendente, Processando, Processado, Erro)
  - Por tipo de arquivo (PDF, XML, Excel, Word, Imagem)
  - Por data (range de datas)
- ✅ **Busca**: Por nome do arquivo
- ✅ **Informações Detalhadas**: Tamanho, tipo MIME, data upload
- ✅ **Ações**: Download, visualizar, excluir
- ✅ **Botão "Novo Documento"**: Com seleção de empresa

#### **Interface:**
```typescript
interface GlobalDocument {
  id: number
  company_id: number
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: "pending" | "processing" | "processed" | "error"
  created_at: string
  company: {
    id: number
    name: string
    cnpj: string
  }
}
```

### **👥 Membros Globais (/members)**

#### **Recursos Implementados:**
- ✅ **Tabela Agrupada**: Usuários com suas múltiplas associações
- ✅ **Múltiplas Empresas**: Mostra todas as empresas que um usuário pertence
- ✅ **Roles por Empresa**: Função específica em cada empresa
- ✅ **Filtros**:
  - Por empresa
  - Por função (Admin, Gerente, Editor, Visualizador)
  - Por status (Ativo/Inativo)
- ✅ **Busca**: Por nome ou email do usuário
- ✅ **Ações Contextuais**: 
  - Editar usuário
  - Adicionar a nova empresa
  - Remover de empresa específica
- ✅ **Botão "Adicionar Membro"**: Com seleção de usuário e empresa

#### **Interface:**
```typescript
interface GlobalMember {
  id: number
  user_id: number
  company_id: number
  role: string
  permissions: string[]
  active: boolean
  created_at: string
  user: {
    id: number
    name: string
    email: string
    active: boolean
  }
  company: {
    id: number
    name: string
    cnpj: string
  }
}
```

## 🔄 **Vantagens da Estrutura Dual**

### **✅ Para Administradores**
- **Visão Global**: Gerenciam tudo de todas as empresas
- **Filtros Poderosos**: Encontram rapidamente o que precisam
- **Operações em Massa**: Podem trabalhar com múltiplas empresas
- **Relatórios Centralizados**: Dados consolidados

### **✅ Para Usuários de Empresa**
- **Contexto Preservado**: Sempre sabem qual empresa estão gerenciando
- **Interface Limpa**: Veem apenas dados relevantes
- **Navegação Simples**: Fluxo direto e intuitivo
- **Menos Confusão**: Não se perdem entre empresas

### **✅ Para Desenvolvedores**
- **Componentes Reutilizáveis**: Lógica compartilhada
- **Manutenção Simples**: Mudanças em um lugar
- **Escalabilidade**: Fácil adicionar novas funcionalidades
- **Flexibilidade**: Atende diferentes casos de uso

## 📋 **Padrões de Implementação**

### **Componentes Globais**
```typescript
// Componente global aceita filtros avançados
export function GlobalCredentialsContent() {
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  // Lógica para filtrar por empresa
}
```

### **Componentes Contextuais**
```typescript
// Componente contextual recebe empresa específica
export function CredentialsContent({ companyId }: { companyId?: string }) {
  // Lógica focada em uma empresa
}
```

### **Navegação Inteligente**
```typescript
// Botões na lista de empresas
<Button onClick={() => router.push(`/companies/${company.id}/credentials`)}>
  Credenciais
</Button>

// Link global no sidebar
<NavLink href="/credentials">Credenciais Globais</NavLink>
```

## 🚀 **Próximos Passos**

1. **Testes**: Verificar todos os fluxos de navegação
2. **Performance**: Otimizar carregamento de dados globais
3. **Permissões**: Implementar controle de acesso por tipo de usuário
4. **Analytics**: Adicionar métricas de uso das páginas
5. **Feedback**: Coletar feedback dos usuários sobre a nova estrutura

## 💡 **Casos de Uso**

### **Administrador do Sistema**
- Acessa `/credentials` para ver todas as credenciais
- Filtra por empresa para auditoria
- Adiciona credenciais para qualquer empresa

### **Gerente de Empresa**
- Acessa `/companies/123/credentials` para sua empresa
- Contexto sempre preservado
- Interface focada e limpa

### **Auditor**
- Usa páginas globais para relatórios
- Filtra por período e empresa
- Exporta dados consolidados

A estrutura dual oferece o melhor dos dois mundos: **flexibilidade global** e **contexto específico**! 🎯
