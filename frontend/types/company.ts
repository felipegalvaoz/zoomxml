// Tipos para empresas baseados na API do backend

export interface Company {
  id: number
  name: string
  cnpj: string
  trade_name?: string
  
  // Endereço
  address?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zip_code?: string
  
  // Contato
  phone?: string
  email?: string
  
  // Dados empresariais
  company_size?: string
  main_activity?: string
  secondary_activity?: string
  legal_nature?: string
  opening_date?: string
  registration_status?: string
  
  // Configurações
  restricted: boolean
  auto_fetch: boolean
  active: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateCompanyRequest {
  // Dados básicos obrigatórios
  name: string
  cnpj: string
  
  // Nome fantasia
  trade_name?: string
  
  // Endereço completo
  address?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zip_code?: string
  
  // Contato
  phone?: string
  email?: string
  
  // Dados empresariais
  company_size?: string
  main_activity?: string
  secondary_activity?: string
  legal_nature?: string
  opening_date?: string
  registration_status?: string
  
  // Configurações do sistema
  restricted: boolean
  auto_fetch: boolean
}

export interface UpdateCompanyRequest {
  // Dados básicos
  name?: string
  cnpj?: string
  trade_name?: string
  
  // Endereço
  address?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zip_code?: string
  
  // Contato
  phone?: string
  email?: string
  
  // Dados empresariais
  company_size?: string
  main_activity?: string
  secondary_activity?: string
  legal_nature?: string
  opening_date?: string
  registration_status?: string
  
  // Configurações
  restricted?: boolean
  auto_fetch?: boolean
  active?: boolean
}

export interface CNPJData {
  cnpj: string
  name: string
  trade_name: string
  address: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  zip_code: string
  phone: string
  email: string
  company_size: string
  main_activity: string
  secondary_activities: string[]
  legal_nature: string
  opening_date: string
  registration_status: string
}

export interface CompaniesResponse {
  companies: Company[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// Opções para campos select
export const COMPANY_SIZE_OPTIONS = [
  { value: "MEI", label: "Microempreendedor Individual (MEI)" },
  { value: "ME", label: "Microempresa (ME)" },
  { value: "EPP", label: "Empresa de Pequeno Porte (EPP)" },
  { value: "MEDIO", label: "Empresa de Médio Porte" },
  { value: "GRANDE", label: "Empresa de Grande Porte" },
]

export const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]
