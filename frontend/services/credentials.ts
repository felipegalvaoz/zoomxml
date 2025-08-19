import { backendApiCall } from "@/lib/auth"
import type { 
  Credential, 
  CreateCredentialRequest, 
  UpdateCredentialRequest,
  CredentialsResponse 
} from "@/types/credential"

export class CredentialsService {
  // List credentials for a company
  static async getCredentials(companyId: number, params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<Credential[]> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const url = `/api/companies/${companyId}/credentials${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return await backendApiCall<Credential[]>(url)
  }

  // Get specific credential
  static async getCredential(companyId: number, credentialId: number): Promise<Credential> {
    return await backendApiCall<Credential>(`/api/companies/${companyId}/credentials/${credentialId}`)
  }

  // Create credential
  static async createCredential(companyId: number, data: CreateCredentialRequest): Promise<Credential> {
    return await backendApiCall<Credential>(`/api/companies/${companyId}/credentials`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Update credential
  static async updateCredential(companyId: number, credentialId: number, data: UpdateCredentialRequest): Promise<Credential> {
    // Validate IDs are valid numbers
    const validCompanyId = Number(companyId)
    const validCredentialId = Number(credentialId)

    if (!Number.isInteger(validCompanyId) || validCompanyId <= 0) {
      throw new Error(`Invalid company ID: ${companyId}`)
    }

    if (!Number.isInteger(validCredentialId) || validCredentialId <= 0) {
      throw new Error(`Invalid credential ID: ${credentialId}`)
    }

    const url = `/api/companies/${validCompanyId}/credentials/${validCredentialId}`


    return await backendApiCall<Credential>(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Delete credential
  static async deleteCredential(companyId: number, credentialId: number): Promise<void> {
    await backendApiCall<void>(`/api/companies/${companyId}/credentials/${credentialId}`, {
      method: 'DELETE',
    })
  }
}

// Utility functions for credential types
export const getCredentialTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    "prefeitura_user_pass": "Usuário/Senha",
    "prefeitura_token": "Token",
    "prefeitura_mixed": "Misto"
  }
  return types[type] || type
}

export const getCredentialTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    "prefeitura_user_pass": "default",
    "prefeitura_token": "secondary", 
    "prefeitura_mixed": "outline"
  }
  return variants[type] || "default"
}

export const getEnvironmentLabel = (environment: string): string => {
  const environments: Record<string, string> = {
    "production": "Produção",
    "staging": "Homologação",
    "development": "Desenvolvimento"
  }
  return environments[environment] || environment
}

export const getEnvironmentBadgeVariant = (environment: string): "default" | "secondary" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    "production": "default",
    "staging": "secondary",
    "development": "outline"
  }
  return variants[environment] || "outline"
}
