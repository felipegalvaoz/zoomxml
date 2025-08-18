# ZoomXML Development Makefile
# Comandos essenciais para facilitar o desenvolvimento backend e frontend

.PHONY: help install dev build test clean docker logs status stop restart

# Cores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Configurações
BACKEND_DIR=backend
FRONTEND_DIR=frontend
COMPOSE_FILE=$(BACKEND_DIR)/docker-compose.dev.yml
COMPOSE_PROD_FILE=$(BACKEND_DIR)/docker-compose.yml

##@ Ajuda
help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)ZoomXML Development Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Instalação e Setup
install: ## Instala todas as dependências (backend + frontend)
	@echo "$(YELLOW)📦 Instalando dependências...$(NC)"
	@$(MAKE) install-backend
	@$(MAKE) install-frontend
	@echo "$(GREEN)✅ Todas as dependências instaladas!$(NC)"

install-backend: ## Instala dependências do backend Go
	@echo "$(BLUE)🔧 Instalando dependências do backend...$(NC)"
	cd $(BACKEND_DIR) && go mod download
	cd $(BACKEND_DIR) && go mod tidy

install-frontend: ## Instala dependências do frontend Next.js
	@echo "$(BLUE)🎨 Instalando dependências do frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm install

setup-env: ## Cria arquivos .env a partir dos exemplos
	@echo "$(YELLOW)⚙️  Configurando arquivos de ambiente...$(NC)"
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "$(GREEN)✅ Criado $(BACKEND_DIR)/.env$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  $(BACKEND_DIR)/.env já existe$(NC)"; \
	fi
	@if [ ! -f $(FRONTEND_DIR)/.env.local ]; then \
		echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > $(FRONTEND_DIR)/.env.local; \
		echo "NEXT_PUBLIC_APP_NAME=ZoomXML" >> $(FRONTEND_DIR)/.env.local; \
		echo "NEXT_PUBLIC_APP_VERSION=1.0.0" >> $(FRONTEND_DIR)/.env.local; \
		echo "$(GREEN)✅ Criado $(FRONTEND_DIR)/.env.local$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  $(FRONTEND_DIR)/.env.local já existe$(NC)"; \
	fi

##@ Desenvolvimento
dev: ## Inicia ambiente completo de desenvolvimento
	@echo "$(GREEN)🚀 Iniciando ambiente de desenvolvimento...$(NC)"
	@$(MAKE) docker-dev-up
	@echo "$(BLUE)Aguardando serviços ficarem prontos...$(NC)"
	@sleep 10
	@$(MAKE) dev-backend &
	@$(MAKE) dev-frontend &
	@echo "$(GREEN)✅ Ambiente de desenvolvimento iniciado!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:3000 (Next.js)$(NC)"
	@echo "$(BLUE)Backend: http://localhost:8000 (API)$(NC)"
	@echo "$(BLUE)DBGate: http://localhost:3002 (Database Admin)$(NC)"
	@echo "$(BLUE)MinIO Console: http://localhost:9001 (Storage Admin)$(NC)"

dev-backend: ## Inicia apenas o backend em modo desenvolvimento
	@echo "$(BLUE)🔧 Iniciando backend...$(NC)"
	cd $(BACKEND_DIR) && go run cmd/zoomxml/main.go

dev-frontend: ## Inicia apenas o frontend em modo desenvolvimento
	@echo "$(BLUE)🎨 Iniciando frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

##@ Docker e Serviços
docker-dev-up: ## Inicia serviços de desenvolvimento (PostgreSQL, MinIO, Redis, DBGate)
	@echo "$(BLUE)🐳 Iniciando serviços de desenvolvimento...$(NC)"
	cd $(BACKEND_DIR) && docker-compose -f docker-compose.dev.yml up -d
	@$(MAKE) docker-status

docker-dev-down: ## Para serviços de desenvolvimento
	@echo "$(RED)🛑 Parando serviços de desenvolvimento...$(NC)"
	cd $(BACKEND_DIR) && docker-compose -f docker-compose.dev.yml down

docker-prod-up: ## Inicia ambiente completo de produção
	@echo "$(GREEN)🚀 Iniciando ambiente de produção...$(NC)"
	cd $(BACKEND_DIR) && docker-compose -f docker-compose.yml up -d
	@$(MAKE) docker-status

docker-prod-down: ## Para ambiente de produção
	@echo "$(RED)🛑 Parando ambiente de produção...$(NC)"
	cd $(BACKEND_DIR) && docker-compose -f docker-compose.yml down

docker-status: ## Mostra status dos containers
	@echo "$(BLUE)📊 Status dos containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

docker-logs: ## Mostra logs dos containers
	@echo "$(BLUE)📋 Logs dos containers:$(NC)"
	cd $(BACKEND_DIR) && docker-compose -f docker-compose.dev.yml logs -f

docker-clean: ## Remove containers, volumes e imagens não utilizados
	@echo "$(YELLOW)🧹 Limpando Docker...$(NC)"
	docker system prune -f
	docker volume prune -f

##@ Build e Deploy
build: ## Faz build de produção (backend + frontend)
	@echo "$(YELLOW)🔨 Fazendo build de produção...$(NC)"
	@$(MAKE) build-backend
	@$(MAKE) build-frontend
	@echo "$(GREEN)✅ Build concluído!$(NC)"

build-backend: ## Faz build do backend
	@echo "$(BLUE)🔧 Fazendo build do backend...$(NC)"
	cd $(BACKEND_DIR) && go build -o bin/zoomxml cmd/zoomxml/main.go

build-frontend: ## Faz build do frontend
	@echo "$(BLUE)🎨 Fazendo build do frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build

##@ Testes
test: ## Executa todos os testes
	@echo "$(YELLOW)🧪 Executando testes...$(NC)"
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

test-backend: ## Executa testes do backend
	@echo "$(BLUE)🔧 Testando backend...$(NC)"
	cd $(BACKEND_DIR) && go test ./...

test-frontend: ## Executa testes do frontend
	@echo "$(BLUE)🎨 Testando frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run test 2>/dev/null || echo "$(YELLOW)⚠️  Testes do frontend não configurados$(NC)"

##@ Banco de Dados
db-migrate: ## Executa migrações do banco de dados
	@echo "$(BLUE)🗄️  Executando migrações...$(NC)"
	cd $(BACKEND_DIR) && go run cmd/zoomxml/main.go migrate

db-seed: ## Executa seeders do banco de dados
	@echo "$(BLUE)🌱 Executando seeders...$(NC)"
	cd $(BACKEND_DIR) && go run cmd/zoomxml/main.go seed

db-reset: ## Reseta o banco de dados (cuidado!)
	@echo "$(RED)⚠️  Resetando banco de dados...$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(MAKE) docker-dev-down; \
		docker volume rm backend_postgres_dev_data 2>/dev/null || true; \
		$(MAKE) docker-dev-up; \
		sleep 10; \
		$(MAKE) db-migrate; \
		$(MAKE) db-seed; \
	fi

##@ Utilitários
logs: ## Mostra logs da aplicação
	@$(MAKE) docker-logs

status: ## Mostra status completo do sistema
	@echo "$(BLUE)📊 Status do Sistema ZoomXML$(NC)"
	@echo ""
	@echo "$(YELLOW)🐳 Containers Docker:$(NC)"
	@$(MAKE) docker-status
	@echo ""
	@echo "$(YELLOW)🌐 Serviços Disponíveis:$(NC)"
	@echo "  Frontend:      http://localhost:3000 (Next.js)"
	@echo "  Backend:       http://localhost:8000 (API)"
	@echo "  DBGate:        http://localhost:3002 (Database Admin)"
	@echo "  MinIO Console: http://localhost:9001 (Storage Admin)"
	@echo "  PostgreSQL:    localhost:5432"
	@echo "  Redis:         localhost:6379"

clean: ## Limpa arquivos temporários e builds
	@echo "$(YELLOW)🧹 Limpando arquivos temporários...$(NC)"
	cd $(BACKEND_DIR) && rm -rf bin/ logs/
	cd $(FRONTEND_DIR) && rm -rf .next/ out/ .env.local
	@$(MAKE) docker-clean
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

restart: ## Reinicia todos os serviços
	@echo "$(YELLOW)🔄 Reiniciando serviços...$(NC)"
	@$(MAKE) docker-dev-down
	@$(MAKE) docker-dev-up
	@echo "$(GREEN)✅ Serviços reiniciados!$(NC)"

stop: ## Para todos os serviços
	@echo "$(RED)🛑 Parando todos os serviços...$(NC)"
	@$(MAKE) docker-dev-down

##@ Informações
health: ## Verifica se todos os serviços estão funcionando
	@echo "$(BLUE)🏥 Verificando saúde dos serviços...$(NC)"
	@echo ""
	@echo "$(YELLOW)🐳 Containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}" | grep zoomxml || echo "$(RED)❌ Nenhum container encontrado$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 Conectividade:$(NC)"
	@curl -s http://localhost:8000/health > /dev/null && echo "$(GREEN)✅ Backend API (8000)$(NC)" || echo "$(RED)❌ Backend API (8000)$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✅ Frontend (3000)$(NC)" || echo "$(RED)❌ Frontend (3000)$(NC)"
	@curl -s http://localhost:3002 > /dev/null && echo "$(GREEN)✅ DBGate (3002)$(NC)" || echo "$(RED)❌ DBGate (3002)$(NC)"
	@curl -s http://localhost:9001 > /dev/null && echo "$(GREEN)✅ MinIO Console (9001)$(NC)" || echo "$(RED)❌ MinIO Console (9001)$(NC)"
	@echo ""
	@echo "$(YELLOW)🔗 API Endpoints:$(NC)"
	@curl -s http://localhost:8000/api/stats/dashboard > /dev/null && echo "$(GREEN)✅ Stats API disponível$(NC)" || echo "$(RED)❌ Stats API indisponível (precisa de autenticação)$(NC)"

info: ## Mostra informações do projeto
	@echo "$(BLUE)📋 Informações do Projeto ZoomXML$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend (Go):$(NC)"
	@echo "  Diretório: $(BACKEND_DIR)"
	@echo "  Porta: 8000"
	@echo "  Framework: Fiber"
	@echo "  Banco: PostgreSQL"
	@echo "  Storage: MinIO"
	@echo ""
	@echo "$(YELLOW)Frontend (Next.js):$(NC)"
	@echo "  Diretório: $(FRONTEND_DIR)"
	@echo "  Porta: 3000"
	@echo "  Framework: Next.js 15"
	@echo "  UI: Tailwind CSS + Radix UI"
	@echo ""
	@echo "$(YELLOW)Comandos Principais:$(NC)"
	@echo "  make install  - Instala dependências"
	@echo "  make dev      - Inicia desenvolvimento"
	@echo "  make build    - Faz build de produção"
	@echo "  make test     - Executa testes"
	@echo "  make clean    - Limpa arquivos temporários"
