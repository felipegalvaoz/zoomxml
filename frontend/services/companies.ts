import { backendApiCall } from "@/lib/auth"
import type { 
  Company, 
  CreateCompanyRequest, 
  UpdateCompanyRequest, 
  CompaniesResponse,
  CNPJData 
} from "@/types/company"

export class CompaniesService {
  // Listar empresas
  static async getCompanies(params?: {
    page?: number
    limit?: number
    active?: boolean
    restricted?: boolean
  }): Promise<CompaniesResponse> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())
    if (params?.restricted !== undefined) searchParams.append('restricted', params.restricted.toString())
    
    const url = `/api/companies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return await backendApiCall<CompaniesResponse>(url)
  }

  // Obter empresa específica
  static async getCompany(id: number): Promise<Company> {
    return await backendApiCall<Company>(`/api/companies/${id}`)
  }

  // Criar empresa
  static async createCompany(data: CreateCompanyRequest): Promise<Company> {
    return await backendApiCall<Company>('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Atualizar empresa
  static async updateCompany(id: number, data: UpdateCompanyRequest): Promise<Company> {
    return await backendApiCall<Company>(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Deletar empresa (apenas admin)
  static async deleteCompany(id: number): Promise<void> {
    await backendApiCall<void>(`/api/companies/${id}`, {
      method: 'DELETE',
    })
  }

  // Consultar CNPJ
  static async consultarCNPJ(cnpj: string): Promise<CNPJData> {
    // Remove formatação do CNPJ
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    return await backendApiCall<CNPJData>(`/api/cnpj/${cleanCNPJ}`)
  }
}

// Utilitários para formatação
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  
  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  )
}

export const cleanCNPJ = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '')
}

export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cleanCNPJ(cnpj)
  
  if (cleaned.length !== 14) return false
  
  // Bloqueia sequências iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false
  
  // Calcula os dígitos verificadores
  const calcDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0)
    
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  
  const base = cleaned.slice(0, 12)
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  const digit1 = calcDigit(base, weights1)
  const digit2 = calcDigit(base + digit1, weights2)
  
  return cleaned.slice(-2) === `${digit1}${digit2}`
}

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

export const cleanCEP = (cep: string): string => {
  return cep.replace(/\D/g, '')
}
