# ZoomXML - Sistema Multi-Empresarial de NFS-e

Sistema completo para gerenciamento de documentos fiscais eletrônicos (NFS-e) com suporte a múltiplas empresas, desenvolvido com Go (backend) e Next.js (frontend).

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose
- Go 1.23+ (para desenvolvimento)
- Node.js 18+ (para desenvolvimento)
- Make (opcional, mas recomendado)

### Instalação e Configuração

1. **Clone o repositório**
```bash
git clone <repo-url>
cd zoomxml
```

2. **Configure o ambiente (usando Make)**
```bash
# Instala todas as dependências e configura ambiente
make install
make setup-env

# Inicia ambiente completo de desenvolvimento
make dev
```

3. **Configuração manual (sem Make)**
```bash
# Backend
cd backend
cp .env.example .env
go mod download

# Frontend
cd ../frontend
npm install

# Serviços (PostgreSQL, MinIO, Redis)
cd ../backend
docker-compose -f docker-compose.dev.yml up -d

# Inicia aplicações
go run cmd/zoomxml/main.go &
cd ../frontend && npm run dev
```

## 🛠️ Comandos Make Disponíveis

O projeto inclui um Makefile completo com comandos essenciais para desenvolvimento:

### Comandos Principais
```bash
make help          # Mostra todos os comandos disponíveis
make install       # Instala dependências (backend + frontend)
make dev           # Inicia ambiente completo de desenvolvimento
make build         # Faz build de produção
make test          # Executa todos os testes
make clean         # Limpa arquivos temporários
```

### Desenvolvimento
```bash
make dev-backend   # Inicia apenas o backend
make dev-frontend  # Inicia apenas o frontend
make status        # Mostra status do sistema
make logs          # Mostra logs dos containers
```

### Docker e Serviços
```bash
make docker-dev-up    # Inicia serviços de desenvolvimento
make docker-dev-down  # Para serviços de desenvolvimento
make docker-status    # Status dos containers
make restart          # Reinicia todos os serviços
```

### Banco de Dados
```bash
make db-migrate    # Executa migrações
make db-seed       # Executa seeders
make db-reset      # Reseta banco (cuidado!)
```

## 🌐 Serviços Disponíveis

Após executar `make dev`, os seguintes serviços estarão disponíveis:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **DBGate** (Admin DB): http://localhost:3002
- **MinIO Console**: http://localhost:9001 (admin/password123)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ Arquitetura

### Backend (Go)
- **Framework**: Fiber (HTTP)
- **ORM**: Bun
- **Banco**: PostgreSQL
- **Storage**: MinIO (S3-compatible)
- **Cache**: Redis
- **Auth**: JWT

### Frontend (Next.js)
- **Framework**: Next.js 15
- **UI**: Tailwind CSS + Radix UI
- **Forms**: React Hook Form + Zod
- **State**: React Context/Hooks

## 📁 Estrutura do Projeto

```
zoomxml/
├── backend/                 # API Go
│   ├── cmd/                # Executáveis
│   ├── internal/           # Código interno
│   │   ├── api/           # Handlers e rotas
│   │   ├── models/        # Modelos do banco
│   │   ├── services/      # Lógica de negócio
│   │   └── storage/       # Armazenamento
│   ├── config/            # Configurações
│   ├── docker-compose.yml # Produção
│   └── docker-compose.dev.yml # Desenvolvimento
├── frontend/               # App Next.js
│   ├── app/               # App Router
│   ├── components/        # Componentes React
│   └── lib/               # Utilitários
└── Makefile               # Comandos de desenvolvimento
```

## 🔐 Autenticação

### Credenciais de Desenvolvimento
- **Admin**: admin@zoomxml.com
- **Teste**: test@zoomxml.com / test123456

### Tokens de API
- **Admin Token**: Configurado no `.env` como `ADMIN_TOKEN`
- **JWT**: Gerado automaticamente no login

## 🧪 Testes

```bash
# Todos os testes
make test

# Apenas backend
make test-backend

# Apenas frontend
make test-frontend

# Verificar saúde dos serviços
make health
```

## 📦 Deploy

### Desenvolvimento
```bash
make dev
```

### Produção
```bash
make docker-prod-up
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Principais

**Backend (.env)**:
```env
# Aplicação
APP_ENV=development
PORT=8000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nfse_metadata

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123

# Autenticação
JWT_SECRET=your-secret-key
ADMIN_TOKEN=admin-secret-token
```

### Portas Utilizadas
- **3000**: Frontend Next.js
- **3002**: DBGate (Database Admin)
- **8000**: Backend Go API
- **5432**: PostgreSQL
- **6379**: Redis
- **9000**: MinIO API
- **9001**: MinIO Console

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.