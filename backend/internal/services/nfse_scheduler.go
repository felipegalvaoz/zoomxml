package services

import (
	"context"
	"time"

	"github.com/zoomxml/config"
	"github.com/zoomxml/internal/database"
	"github.com/zoomxml/internal/logger"
	"github.com/zoomxml/internal/models"
)

// NFSeScheduler handles automatic NFSe document fetching
type NFSeScheduler struct {
	nfseService *NFSeService
	ticker      *time.Ticker
	stopChan    chan bool
	running     bool
	config      *config.Config
}

// NewNFSeScheduler creates a new NFSe scheduler
func NewNFSeScheduler() *NFSeScheduler {
	return &NFSeScheduler{
		nfseService: NewNFSeService(),
		stopChan:    make(chan bool),
		running:     false,
		config:      config.Get(),
	}
}

// Start begins the automatic NFSe fetching process
func (s *NFSeScheduler) Start() error {
	if !s.config.NFSeScheduler.Enabled {
		logger.InfoWithFields("NFSe scheduler is disabled", map[string]any{
			"operation": "start_scheduler",
		})
		return nil
	}

	if s.running {
		logger.WarnWithFields("NFSe scheduler already running", map[string]any{
			"operation": "start_scheduler",
		})
		return nil
	}

	// Parse interval from config
	interval, err := time.ParseDuration(s.config.NFSeScheduler.Interval)
	if err != nil {
		logger.ErrorWithFields("Invalid scheduler interval", err, map[string]any{
			"operation": "start_scheduler",
			"interval":  s.config.NFSeScheduler.Interval,
		})
		return err
	}

	s.ticker = time.NewTicker(interval)
	s.running = true

	logger.InfoWithFields("Starting NFSe scheduler", map[string]any{
		"operation":       "start_scheduler",
		"interval":        interval.String(),
		"fetch_days_back": s.config.NFSeScheduler.FetchDaysBack,
		"max_pages":       s.config.NFSeScheduler.MaxPagesPerRun,
	})

	go s.run()
	return nil
}

// Stop stops the automatic NFSe fetching process
func (s *NFSeScheduler) Stop() {
	if !s.running {
		return
	}

	logger.InfoWithFields("Stopping NFSe scheduler", map[string]any{
		"operation": "stop_scheduler",
	})

	s.stopChan <- true
	s.ticker.Stop()
	s.running = false
}

// run is the main scheduler loop
func (s *NFSeScheduler) run() {
	// Run immediately on start
	s.fetchAllCompanies()

	for {
		select {
		case <-s.ticker.C:
			s.fetchAllCompanies()
		case <-s.stopChan:
			logger.InfoWithFields("NFSe scheduler stopped", map[string]any{
				"operation": "scheduler_stopped",
			})
			return
		}
	}
}

// fetchAllCompanies fetches NFSe documents for all companies with auto_fetch enabled
func (s *NFSeScheduler) fetchAllCompanies() {
	ctx := context.Background()

	logger.InfoWithFields("Starting scheduled NFSe fetch for all companies", map[string]any{
		"operation":       "scheduled_fetch",
		"fetch_days_back": s.config.NFSeScheduler.FetchDaysBack,
	})

	// Get all companies with auto_fetch enabled
	companies := []models.Company{}
	err := database.DB.NewSelect().
		Model(&companies).
		Where("auto_fetch = true AND active = true").
		Scan(ctx)

	if err != nil {
		logger.ErrorWithFields("Failed to fetch companies for scheduled NFSe fetch", err, map[string]any{
			"operation": "scheduled_fetch",
		})
		return
	}

	logger.InfoWithFields("Found companies for scheduled fetch", map[string]any{
		"operation":       "scheduled_fetch",
		"companies_count": len(companies),
	})

	// Process each company
	successCount := 0
	for _, company := range companies {
		if s.fetchCompanyDocuments(ctx, &company) {
			successCount++
		}
	}

	logger.InfoWithFields("Completed scheduled NFSe fetch", map[string]any{
		"operation":         "scheduled_fetch",
		"companies_total":   len(companies),
		"companies_success": successCount,
	})
}

// fetchCompanyDocuments fetches NFSe documents for a specific company
func (s *NFSeScheduler) fetchCompanyDocuments(ctx context.Context, company *models.Company) bool {
	logger.InfoWithFields("Fetching NFSe documents for company", map[string]any{
		"operation":    "fetch_company_documents",
		"company_id":   company.ID,
		"company_name": company.Name,
		"company_cnpj": company.CNPJ,
	})

	// Get company credentials - use only token-based credentials
	credentials := []models.CompanyCredential{}
	err := database.DB.NewSelect().
		Model(&credentials).
		Where("company_id = ? AND active = true", company.ID).
		Where("type = 'prefeitura_token'").
		Scan(ctx)

	if err != nil {
		logger.ErrorWithFields("Failed to fetch company credentials", err, map[string]any{
			"operation":  "fetch_company_documents",
			"company_id": company.ID,
		})
		return false
	}

	if len(credentials) == 0 {
		logger.WarnWithFields("No NFSe credentials found for company", map[string]any{
			"operation":  "fetch_company_documents",
			"company_id": company.ID,
		})
		return false
	}

	logger.InfoWithFields("Found credentials for company", map[string]any{
		"operation":         "fetch_company_documents",
		"company_id":        company.ID,
		"credentials_count": len(credentials),
		"credential_types":  getCredentialTypes(credentials),
	})

	// Use the first available credential (now prioritized by token availability)
	credential := &credentials[0]

	logger.InfoWithFields("Selected credential for API call", map[string]any{
		"operation":       "fetch_company_documents",
		"company_id":      company.ID,
		"credential_id":   credential.ID,
		"credential_type": credential.Type,
	})

	// Calculate intelligent date range based on last sync
	endDate := time.Now()
	startDate := s.calculateOptimalStartDate(ctx, company.ID, endDate)

	// Skip if no new data is expected
	if startDate.After(endDate) {
		logger.InfoWithFields("No new documents expected, skipping company", map[string]any{
			"operation":  "fetch_company_documents",
			"company_id": company.ID,
			"reason":     "start_date_after_end_date",
		})
		return true
	}

	// Calculate actual days difference for verification
	daysDiff := int(endDate.Sub(startDate).Hours() / 24)

	logger.InfoWithFields("Fetching documents for optimized date range", map[string]any{
		"operation":        "fetch_company_documents",
		"company_id":       company.ID,
		"start_date":       startDate.Format("2006-01-02"),
		"end_date":         endDate.Format("2006-01-02"),
		"config_days_back": s.config.NFSeScheduler.FetchDaysBack,
		"calculated_days":  daysDiff,
		"optimization":     "enabled",
	})

	// Check if we should skip this fetch based on recent activity
	if s.shouldSkipFetch(ctx, company.ID, startDate, endDate) {
		logger.InfoWithFields("Skipping fetch - no new documents expected", map[string]any{
			"operation":  "fetch_company_documents",
			"company_id": company.ID,
			"reason":     "recent_sync_completed",
		})
		return true
	}

	totalDocuments := 0
	// Try to fetch multiple pages
	for page := 1; page <= s.config.NFSeScheduler.MaxPagesPerRun; page++ {
		logger.InfoWithFields("Fetching NFSe documents page", map[string]any{
			"operation":       "fetch_company_documents",
			"company_id":      company.ID,
			"page":            page,
			"credential_id":   credential.ID,
			"credential_type": credential.Type,
		})

		result, err := s.nfseService.FetchNFSeDocuments(ctx, credential, startDate, endDate, page)
		if err != nil {
			logger.ErrorWithFields("Failed to fetch NFSe documents", err, map[string]any{
				"operation":     "fetch_company_documents",
				"company_id":    company.ID,
				"page":          page,
				"credential_id": credential.ID,
				"error_details": err.Error(),
			})
			break
		}

		if !result.Success {
			logger.WarnWithFields("NFSe fetch was not successful", map[string]any{
				"operation":  "fetch_company_documents",
				"company_id": company.ID,
				"page":       page,
				"result":     result,
			})
			break
		}

		if len(result.Documents) == 0 {
			logger.InfoWithFields("No more documents found", map[string]any{
				"operation":  "fetch_company_documents",
				"company_id": company.ID,
				"page":       page,
			})
			break
		}

		// Store documents
		logger.InfoWithFields("Storing NFSe documents", map[string]any{
			"operation":       "fetch_company_documents",
			"company_id":      company.ID,
			"page":            page,
			"documents_count": len(result.Documents),
		})

		err = s.nfseService.StoreNFSeDocuments(ctx, company.ID, result.Documents)
		if err != nil {
			logger.ErrorWithFields("Failed to store NFSe documents", err, map[string]any{
				"operation":     "fetch_company_documents",
				"company_id":    company.ID,
				"page":          page,
				"error_details": err.Error(),
			})
		} else {
			totalDocuments += len(result.Documents)
			logger.InfoWithFields("Successfully stored NFSe documents", map[string]any{
				"operation":       "fetch_company_documents",
				"company_id":      company.ID,
				"page":            page,
				"documents_count": len(result.Documents),
				"total_so_far":    totalDocuments,
			})
		}

		// If we got less than 100 documents (max per page), we're done
		if len(result.Documents) < 100 {
			break
		}

		// Add delay between pages to be respectful to the API
		if s.config.NFSeScheduler.APIDelaySeconds > 0 {
			time.Sleep(time.Duration(s.config.NFSeScheduler.APIDelaySeconds) * time.Second)
		}
	}

	success := totalDocuments > 0
	logger.InfoWithFields("Completed NFSe fetch for company", map[string]any{
		"operation":       "fetch_company_documents",
		"company_id":      company.ID,
		"company_name":    company.Name,
		"company_cnpj":    company.CNPJ,
		"total_documents": totalDocuments,
		"success":         success,
	})

	return success
}

// IsRunning returns whether the scheduler is currently running
func (s *NFSeScheduler) IsRunning() bool {
	return s.running
}

// FetchCompanyNow immediately fetches NFSe documents for a specific company
func (s *NFSeScheduler) FetchCompanyNow(ctx context.Context, companyID int64) error {
	// Get company
	company := &models.Company{}
	err := database.DB.NewSelect().
		Model(company).
		Where("id = ? AND active = true", companyID).
		Scan(ctx)

	if err != nil {
		return err
	}

	// Fetch documents
	s.fetchCompanyDocuments(ctx, company)
	return nil
}

// calculateOptimalStartDate calculates the optimal start date for fetching based on existing data
func (s *NFSeScheduler) calculateOptimalStartDate(ctx context.Context, companyID int64, endDate time.Time) time.Time {
	// Default fallback: use config days back
	defaultStartDate := endDate.AddDate(0, 0, -s.config.NFSeScheduler.FetchDaysBack)

	// Find the most recent document for this company
	var latestDoc models.Document
	err := database.DB.NewSelect().
		Model(&latestDoc).
		Where("company_id = ? AND type = 'nfse'", companyID).
		Order("issue_date DESC").
		Limit(1).
		Scan(ctx)

	if err != nil {
		// No documents found or error - use default range
		logger.InfoWithFields("No existing documents found, using default date range", map[string]any{
			"operation":  "calculate_optimal_start_date",
			"company_id": companyID,
			"start_date": defaultStartDate.Format("2006-01-02"),
			"reason":     "no_existing_documents",
		})
		return defaultStartDate
	}

	// Calculate start date based on latest document
	// Add a small buffer (1 day back) to ensure we don't miss any documents
	optimizedStartDate := latestDoc.IssueDate.AddDate(0, 0, -1)

	// Ensure we don't go too far back (respect the config limit)
	if optimizedStartDate.Before(defaultStartDate) {
		optimizedStartDate = defaultStartDate
	}

	// Ensure we don't start in the future
	if optimizedStartDate.After(endDate) {
		optimizedStartDate = endDate
	}

	logger.InfoWithFields("Calculated optimized start date", map[string]any{
		"operation":         "calculate_optimal_start_date",
		"company_id":        companyID,
		"latest_doc_date":   latestDoc.IssueDate.Format("2006-01-02"),
		"optimized_start":   optimizedStartDate.Format("2006-01-02"),
		"default_start":     defaultStartDate.Format("2006-01-02"),
		"days_saved":        int(optimizedStartDate.Sub(defaultStartDate).Hours() / 24),
		"latest_doc_number": latestDoc.Number,
	})

	return optimizedStartDate
}

// shouldSkipFetch determines if we should skip the API fetch based on recent activity
func (s *NFSeScheduler) shouldSkipFetch(ctx context.Context, companyID int64, startDate, endDate time.Time) bool {
	// Don't skip if the date range is very small (less than 7 days)
	daysDiff := int(endDate.Sub(startDate).Hours() / 24)
	if daysDiff < 7 {
		return false
	}

	// Check if we have recent documents that cover most of the requested period
	// This helps avoid unnecessary API calls when we already have recent data
	recentThreshold := endDate.AddDate(0, 0, -3) // Last 3 days

	recentDocCount, err := database.DB.NewSelect().
		Model((*models.Document)(nil)).
		Where("company_id = ? AND type = 'nfse'", companyID).
		Where("issue_date >= ? AND issue_date <= ?", recentThreshold, endDate).
		Count(ctx)

	if err != nil {
		// If we can't check, don't skip
		return false
	}

	// If we have recent documents and the range is large, we might skip
	// This is a heuristic: if we have documents in the last 3 days and we're asking for a large range,
	// it's likely we're up to date
	if recentDocCount > 0 && daysDiff > 30 {
		logger.InfoWithFields("Recent documents found, considering skip", map[string]any{
			"operation":        "should_skip_fetch",
			"company_id":       companyID,
			"recent_doc_count": recentDocCount,
			"days_diff":        daysDiff,
			"recent_threshold": recentThreshold.Format("2006-01-02"),
		})

		// Additional check: see if we've fetched recently (within last hour)
		lastFetchTime := s.getLastFetchTime(ctx, companyID)
		if lastFetchTime != nil && time.Since(*lastFetchTime) < time.Hour {
			logger.InfoWithFields("Recent fetch detected, skipping", map[string]any{
				"operation":  "should_skip_fetch",
				"company_id": companyID,
				"last_fetch": lastFetchTime.Format("2006-01-02 15:04:05"),
				"time_since": time.Since(*lastFetchTime).String(),
			})
			return true
		}
	}

	return false
}

// getLastFetchTime gets the last time we successfully fetched documents for a company
func (s *NFSeScheduler) getLastFetchTime(ctx context.Context, companyID int64) *time.Time {
	var latestDoc models.Document
	err := database.DB.NewSelect().
		Model(&latestDoc).
		Where("company_id = ? AND type = 'nfse'", companyID).
		Order("created_at DESC").
		Limit(1).
		Scan(ctx)

	if err != nil {
		return nil
	}

	return &latestDoc.CreatedAt
}

// GetStatus returns the current status of the scheduler
func (s *NFSeScheduler) GetStatus() map[string]any {
	return map[string]any{
		"running":           s.running,
		"enabled":           s.config.NFSeScheduler.Enabled,
		"interval":          s.config.NFSeScheduler.Interval,
		"fetch_days_back":   s.config.NFSeScheduler.FetchDaysBack,
		"max_pages_per_run": s.config.NFSeScheduler.MaxPagesPerRun,
		"api_delay_seconds": s.config.NFSeScheduler.APIDelaySeconds,
	}
}

// getCredentialTypes returns a slice of credential types for logging
func getCredentialTypes(credentials []models.CompanyCredential) []string {
	types := make([]string, len(credentials))
	for i, cred := range credentials {
		types[i] = cred.Type
	}
	return types
}
