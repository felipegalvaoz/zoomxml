"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyForm } from "@/components/forms/company-form"
import { CompaniesService } from "@/services/companies"
import type { CreateCompanyRequest } from "@/types/company"

export function CreateCompanyContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateCompanyRequest) => {
    try {
      setIsLoading(true)
      await CompaniesService.createCompany(data)
      
      // Redirecionar para a lista de empresas após sucesso
      router.push("/companies")
    } catch (error) {
      let errorMessage = "Erro ao criar empresa"

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
    router.push("/companies")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/companies")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Nova Empresa
          </h1>
          <p className="text-muted-foreground">
            Preencha as informações da nova empresa. Use o botão de consulta CNPJ para preencher automaticamente os dados.
          </p>
        </div>
      </div>

      {/* Form Layout */}
      <div className="max-w-5xl mx-auto">
        <CompanyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          layout="accordion"
        />
      </div>
    </div>
  )
}
