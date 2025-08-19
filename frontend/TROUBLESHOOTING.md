# Guia de Solução de Problemas

## Erros Resolvidos

### 1. Erro 404 nos arquivos JavaScript do Next.js

**Erro:**
```
GET http://127.0.0.1:3001/_next/static/chunks/main-app.js?v=1755607482538 net::ERR_ABORTED 404 (Not Found)
GET http://127.0.0.1:3001/_next/static/chunks/app-pages-internals.js net::ERR_ABORTED 404 (Not Found)
```

**Causa:**
- Conflitos entre rotas antigas e novas após reestruturação
- Cache corrompido do Next.js
- Problemas de compilação TypeScript

**Solução Aplicada:**
1. Limpeza completa do cache:
   ```bash
   rm -rf .next node_modules/.cache
   npm install
   ```

2. Correção dos tipos para Next.js 15:
   - `params` agora são assíncronos e devem ser do tipo `Promise<{id: string}>`
   - Uso do hook `use()` do React para resolver as promises

3. Correção do schema Zod:
   - Removido `.default(true)` do campo `active` para evitar conflitos de tipos

### 2. Erros de TypeScript com Next.js 15

**Erro:**
```
Type 'CompanyCredentialsPageProps' does not satisfy the constraint 'PageProps'.
Types of property 'params' are incompatible.
```

**Solução:**
```tsx
// Antes (Next.js 14)
interface PageProps {
  params: { id: string }
}

// Depois (Next.js 15)
interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const { id } = use(params) // Hook use() do React
  return <Component companyId={id} />
}
```

### 3. Erro no Schema Zod

**Erro:**
```
Type 'boolean | undefined' is not assignable to type 'boolean'.
```

**Solução:**
```tsx
// Antes
active: z.boolean().default(true),

// Depois
active: z.boolean(),
```

## Comandos Úteis para Solução de Problemas

### Limpeza Completa
```bash
# Limpar cache e dependências
rm -rf .next node_modules/.cache
npm install

# Rebuild completo
npm run build
```

### Verificação de Tipos
```bash
# Verificar erros de TypeScript
npx tsc --noEmit

# Lint do código
npm run lint
```

### Debug do Next.js
```bash
# Modo debug
DEBUG=* npm run dev

# Build com informações detalhadas
npm run build -- --debug
```

## Estrutura de Rotas Atual

```
app/
├── (dashboard)/           # Grupo de rotas com layout compartilhado
│   ├── layout.tsx        # Layout compartilhado
│   ├── loading.tsx       # Template de loading
│   ├── dashboard/        # /dashboard
│   ├── companies/        # /companies
│   │   └── [id]/         # /companies/[id]
│   │       ├── credentials/  # /companies/[id]/credentials
│   │       ├── documents/    # /companies/[id]/documents
│   │       └── members/      # /companies/[id]/members
│   ├── credentials/      # /credentials
│   ├── documents/        # /documents
│   ├── members/          # /members
│   ├── users/            # /users
│   └── audit/            # /audit
├── login/                # /login (fora do dashboard)
└── page.tsx              # / (redireciona para /dashboard)
```

## Prevenção de Problemas Futuros

1. **Sempre limpar cache após mudanças estruturais:**
   ```bash
   rm -rf .next && npm run dev
   ```

2. **Verificar tipos antes do build:**
   ```bash
   npx tsc --noEmit
   ```

3. **Usar o padrão correto para rotas dinâmicas no Next.js 15:**
   ```tsx
   export default function Page({ params }: { params: Promise<{id: string}> }) {
     const { id } = use(params)
     // ...
   }
   ```

4. **Manter consistência nos schemas Zod:**
   - Evitar `.default()` em campos obrigatórios
   - Usar tipos explícitos quando necessário
