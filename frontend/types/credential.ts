// Types for credentials based on the backend API

export interface Credential {
  id: number
  company_id: number
  type: string
  name: string
  description?: string
  login?: string
  environment?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCredentialRequest {
  type: string
  name: string
  description?: string
  login?: string
  password?: string
  token?: string
  environment?: string
}

export interface UpdateCredentialRequest {
  name?: string
  description?: string
  login?: string
  password?: string
  token?: string
  environment?: string
  active?: boolean
}

export interface CredentialsResponse {
  credentials: Credential[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

// Credential type options
export const CREDENTIAL_TYPES = [
  { value: "prefeitura_user_pass", label: "Usuário/Senha" },
  { value: "prefeitura_token", label: "Token" },
  { value: "prefeitura_mixed", label: "Misto" },
] as const

// Environment options
export const ENVIRONMENT_OPTIONS = [
  { value: "production", label: "Produção" },
  { value: "staging", label: "Homologação" },
  { value: "development", label: "Desenvolvimento" },
] as const

export type CredentialType = typeof CREDENTIAL_TYPES[number]["value"]
export type Environment = typeof ENVIRONMENT_OPTIONS[number]["value"]
