package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/zoomxml/internal/api/middleware"
	"github.com/zoomxml/internal/database"
	"github.com/zoomxml/internal/models"
	"github.com/zoomxml/internal/permissions"
)

// DocumentHandler gerencia as operações de documentos
type DocumentHandler struct{}

// NewDocumentHandler cria uma nova instância do handler de documentos
func NewDocumentHandler() *DocumentHandler {
	return &DocumentHandler{}
}

// DocumentsResponse representa a resposta da listagem de documentos
type DocumentsResponse struct {
	Documents  []models.Document `json:"documents"`
	Pagination struct {
		Page       int `json:"page"`
		Limit      int `json:"limit"`
		Total      int `json:"total"`
		TotalPages int `json:"total_pages"`
	} `json:"pagination"`
}

// GetDocuments lista todos os documentos do sistema
// @Summary Listar documentos
// @Description Lista todos os documentos do sistema com paginação e filtros, respeitando permissões de acesso
// @Tags documents
// @Produce json
// @Param page query int false "Página (padrão: 1)"
// @Param limit query int false "Itens por página (padrão: 20)"
// @Param type query string false "Filtrar por tipo de documento (nfse, nfe, cte)"
// @Param status query string false "Filtrar por status (pending, processed, error)"
// @Param company_id query int false "Filtrar por empresa"
// @Success 200 {object} DocumentsResponse "Lista de documentos"
// @Failure 401 {object} fiber.Map "Token inválido"
// @Failure 500 {object} fiber.Map "Erro interno"
// @Security BearerAuth
// @Router /documents [get]
func (h *DocumentHandler) GetDocuments(c *fiber.Ctx) error {
	// Obter usuário do contexto
	user := middleware.GetUserFromContext(c)
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authentication required",
		})
	}

	// Parse pagination parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 0) // 0 = sem limite, buscar todos

	var offset int
	if limit > 0 {
		offset = (page - 1) * limit
	} else {
		offset = 0
		page = 1 // Se não há limite, sempre página 1
	}

	// Parse filter parameters
	docType := c.Query("type")
	status := c.Query("status")
	companyIDStr := c.Query("company_id")

	// Build query
	query := database.DB.NewSelect().
		Model((*models.Document)(nil)).
		Relation("Company")

	// Apply company visibility rules
	if !user.IsAdmin() {
		// Usuário comum - apenas documentos de empresas não restritas + empresas onde é membro
		query = query.Where(`
			company_id IN (
				SELECT c.id FROM companies c
				WHERE (c.restricted = false AND c.active = true) OR
				(c.id IN (
					SELECT cm.company_id FROM company_members cm
					WHERE cm.user_id = ? AND cm.company_id = c.id
				))
			)
		`, user.ID)
	}

	// Apply filters
	if docType != "" {
		query = query.Where("type = ?", docType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if companyIDStr != "" {
		companyID, err := strconv.ParseInt(companyIDStr, 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid company_id parameter",
			})
		}

		// Verificar se o usuário tem acesso à empresa
		if !user.IsAdmin() {
			err := permissions.CanAccessCompany(c.Context(), user, companyID)
			if err != nil {
				if err == permissions.ErrCompanyNotFound {
					return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
						"error": "Company not found",
					})
				}
				if err == permissions.ErrAccessDenied {
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
						"error": "Access denied to this company",
					})
				}
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to check company access",
				})
			}
		}

		query = query.Where("company_id = ?", companyID)
	}

	// Count total documents
	total, err := query.Count(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count documents",
		})
	}

	// Fetch documents with pagination (se limit > 0)
	var documents []models.Document
	queryWithOrder := query.Order("created_at DESC")

	if limit > 0 {
		queryWithOrder = queryWithOrder.Limit(limit).Offset(offset)
	}

	err = queryWithOrder.Scan(c.Context(), &documents)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch documents",
		})
	}

	// Build response
	response := DocumentsResponse{
		Documents: documents,
	}
	response.Pagination.Page = page
	response.Pagination.Limit = limit
	response.Pagination.Total = total

	// Calcular total de páginas
	if limit > 0 {
		response.Pagination.TotalPages = (total + limit - 1) / limit // Ceiling division
	} else {
		response.Pagination.TotalPages = 1 // Se não há limite, apenas 1 página
	}

	return c.JSON(response)
}

// GetDocument obtém um documento específico
// @Summary Obter documento
// @Description Obtém um documento específico por ID, respeitando permissões de acesso
// @Tags documents
// @Produce json
// @Param id path int true "ID do documento"
// @Success 200 {object} models.Document "Documento encontrado"
// @Failure 401 {object} fiber.Map "Token inválido"
// @Failure 403 {object} fiber.Map "Acesso negado"
// @Failure 404 {object} fiber.Map "Documento não encontrado"
// @Failure 500 {object} fiber.Map "Erro interno"
// @Security BearerAuth
// @Router /documents/{id} [get]
func (h *DocumentHandler) GetDocument(c *fiber.Ctx) error {
	// Obter usuário do contexto
	user := middleware.GetUserFromContext(c)
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authentication required",
		})
	}

	// Parse document ID
	documentID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid document ID",
		})
	}

	// Fetch document
	var document models.Document
	query := database.DB.NewSelect().
		Model(&document).
		Relation("Company").
		Where("d.id = ?", documentID)

	// Apply company visibility rules for non-admin users
	if !user.IsAdmin() {
		query = query.Where(`
			company_id IN (
				SELECT c.id FROM companies c
				WHERE (c.restricted = false AND c.active = true) OR
				(c.id IN (
					SELECT cm.company_id FROM company_members cm
					WHERE cm.user_id = ? AND cm.company_id = c.id
				))
			)
		`, user.ID)
	}

	err = query.Scan(c.Context())
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Document not found",
		})
	}

	return c.JSON(document)
}

// DeleteDocument remove um documento
// @Summary Remover documento
// @Description Remove um documento específico (apenas admin ou membro da empresa)
// @Tags documents
// @Produce json
// @Param id path int true "ID do documento"
// @Success 200 {object} fiber.Map "Documento removido com sucesso"
// @Failure 401 {object} fiber.Map "Token inválido"
// @Failure 403 {object} fiber.Map "Acesso negado"
// @Failure 404 {object} fiber.Map "Documento não encontrado"
// @Failure 500 {object} fiber.Map "Erro interno"
// @Security BearerAuth
// @Router /documents/{id} [delete]
func (h *DocumentHandler) DeleteDocument(c *fiber.Ctx) error {
	// Obter usuário do contexto
	user := middleware.GetUserFromContext(c)
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authentication required",
		})
	}

	// Parse document ID
	documentID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid document ID",
		})
	}

	// Fetch document to check permissions
	var document models.Document
	err = database.DB.NewSelect().
		Model(&document).
		Where("id = ?", documentID).
		Scan(c.Context())

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Document not found",
		})
	}

	// Check permissions
	if !user.IsAdmin() {
		err := permissions.CanAccessCompany(c.Context(), user, document.CompanyID)
		if err != nil {
			if err == permissions.ErrCompanyNotFound {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"error": "Company not found",
				})
			}
			if err == permissions.ErrAccessDenied {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "Access denied",
				})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to check permissions",
			})
		}
	}

	// Delete document
	_, err = database.DB.NewDelete().
		Model(&document).
		Where("id = ?", documentID).
		Exec(c.Context())

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete document",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Document deleted successfully",
	})
}
