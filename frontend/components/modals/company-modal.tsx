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
      alert(error instanceof Error ? error.message : "Erro ao salvar empresa")
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
