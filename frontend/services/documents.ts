import { backendApiCall } from "@/lib/auth"

export interface Document {
  id: number
  company_id: number
  type: string
  key?: string
  number?: string
  series?: string
  issue_date?: string
  due_date?: string
  amount?: number
  status: "pending" | "processing" | "processed" | "error"
  storage_key?: string
  hash?: string
  metadata?: any
  verification_code?: string
  provider_cnpj?: string
  taker_cnpj?: string
  service_value?: number
  service_code?: string
  municipal_registration?: string
  document_hash?: string
  is_cancelled?: boolean
  is_substituted?: boolean
  processing_date?: string
  competence?: string
  rps_issue_date?: string
  taker_name?: string
  provider_name?: string
  provider_trade_name?: string
  created_at: string
  updated_at: string
}

export interface GlobalDocument extends Document {
  company?: {
    id: number
    name: string
    cnpj: string
    trade_name?: string
    address?: string
    city?: string
    state?: string
    phone?: string
    active?: boolean
    restricted?: boolean
  }
}

export interface DocumentsResponse {
  documents: GlobalDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface DocumentFilters {
  page?: number
  limit?: number
  company_id?: number
  type?: string
  status?: string
  start_date?: string
  end_date?: string
  search?: string
}

export class DocumentsService {
  // Listar todos os documentos (global) - SEM LIMITE
  static async getGlobalDocuments(filters?: DocumentFilters): Promise<DocumentsResponse> {
    const searchParams = new URLSearchParams()

    // NÃO enviar limite para buscar TODOS os documentos
    if (filters?.page) searchParams.append('page', filters.page.toString())
    // Não enviar limit para buscar todos os documentos

    if (filters?.company_id) searchParams.append('company_id', filters.company_id.toString())
    if (filters?.type) searchParams.append('type', filters.type)
    if (filters?.status) searchParams.append('status', filters.status)
    if (filters?.start_date) searchParams.append('start_date', filters.start_date)
    if (filters?.end_date) searchParams.append('end_date', filters.end_date)
    if (filters?.search) searchParams.append('search', filters.search)

    const url = `/api/documents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return await backendApiCall<DocumentsResponse>(url)
  }

  // Listar documentos de uma empresa específica
  static async getCompanyDocuments(companyId: number, filters?: Omit<DocumentFilters, 'company_id'>): Promise<DocumentsResponse> {
    const searchParams = new URLSearchParams()
    
    if (filters?.page) searchParams.append('page', filters.page.toString())
    if (filters?.limit) searchParams.append('limit', filters.limit.toString())
    if (filters?.type) searchParams.append('type', filters.type)
    if (filters?.status) searchParams.append('status', filters.status)
    if (filters?.start_date) searchParams.append('start_date', filters.start_date)
    if (filters?.end_date) searchParams.append('end_date', filters.end_date)
    if (filters?.search) searchParams.append('search', filters.search)
    
    const url = `/api/companies/${companyId}/documents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return await backendApiCall<DocumentsResponse>(url)
  }

  // Obter documento específico
  static async getDocument(id: number): Promise<GlobalDocument> {
    return await backendApiCall<GlobalDocument>(`/api/documents/${id}`)
  }

  // Download de documento
  static async downloadDocument(id: number): Promise<Blob> {
    return await backendApiCall<Blob>(`/api/documents/${id}/download`, {
      method: 'GET',
    })
  }

  // Excluir documento
  static async deleteDocument(id: number): Promise<void> {
    await backendApiCall<void>(`/api/documents/${id}`, {
      method: 'DELETE',
    })
  }

  // Excluir múltiplos documentos
  static async deleteDocuments(ids: number[]): Promise<void> {
    await backendApiCall<void>('/api/documents/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// Tipos de documento
export const DOCUMENT_TYPES = [
  { value: "nfse", label: "NFS-e" },
  { value: "nfe", label: "NF-e" },
  { value: "nfce", label: "NFC-e" },
  { value: "cte", label: "CT-e" },
  { value: "mdfe", label: "MDF-e" },
  { value: "rps", label: "RPS" },
  { value: "invoice", label: "Fatura" },
  { value: "receipt", label: "Recibo" },
  { value: "contract", label: "Contrato" },
  { value: "other", label: "Outro" },
] as const

// Status de documento
export const DOCUMENT_STATUS = [
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "processed", label: "Processado" },
  { value: "error", label: "Erro" },
] as const

// Função para obter o label do tipo de documento
export function getDocumentTypeLabel(type: string): string {
  const docType = DOCUMENT_TYPES.find(t => t.value === type)
  return docType?.label || type
}

// Função para obter o label do status
export function getDocumentStatusLabel(status: string): string {
  const docStatus = DOCUMENT_STATUS.find(s => s.value === status)
  return docStatus?.label || status
}

// Função para formatar valor monetário
export function formatCurrency(value: number | null | undefined): string {
  if (!value) return "R$ 0,00"
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para formatar data
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("pt-BR")
}

// Função para formatar data e hora
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("pt-BR")
}
