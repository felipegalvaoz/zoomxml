"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CompanyForm } from "@/components/forms/company-form"
import { CompaniesService } from "@/services/companies"
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from "@/types/company"

interface CompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
  onSuccess: () => void
}

export function CompanyModal({ open, onOpenChange, company, onSuccess }: CompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateCompanyRequest | UpdateCompanyRequest) => {
    try {
      setIsLoading(true)

      if (company) {
        // Atualizar empresa existente
        await CompaniesService.updateCompany(company.id, data as UpdateCompanyRequest)
      } else {
        // Criar nova empresa
        await CompaniesService.createCompany(data as CreateCompanyRequest)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      let errorMessage = "Erro ao salvar empresa"

      if (error instanceof Error) {
        // Verificar se é erro de validação
        if (error.message.includes("Validation failed")) {
          errorMessage = "Por favor, verifique os dados informados. Alguns campos obrigatórios podem estar faltando ou inválidos."
        } else if (error.message.includes("email must be a valid email")) {
          errorMessage = "Por favor, informe um email válido ou deixe o campo vazio."
        } else if (error.message.includes("CNPJ already exists")) {
          errorMessage = "Este CNPJ já está cadastrado no sistema."
        } else {
          errorMessage = error.message
        }
      }

      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {company 
              ? "Atualize as informações da empresa abaixo."
              : "Preencha as informações da nova empresa. Use o botão de consulta CNPJ para preencher automaticamente os dados."
            }
          </DialogDescription>
        </DialogHeader>
        
        <CompanyForm
          company={company}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
