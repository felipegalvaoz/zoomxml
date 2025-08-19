"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Building2, Save, X, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CompaniesService, validateCNPJ, cleanCNPJ } from "@/services/companies"
import type { CNPJData } from "@/types/company"

interface CompanyFormData {
  name: string
  trade_name?: string
  cnpj: string

  // Endereço completo
  address?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zip_code?: string

  // Contato
  email?: string
  phone?: string

  // Dados empresariais
  company_size?: string
  main_activity?: string
  secondary_activity?: string
  legal_nature?: string
  opening_date?: string
  registration_status?: string

  // Configurações
  active: boolean
  restricted: boolean
  auto_fetch: boolean
}

interface CompanyFormProps {
  company?: {
    id: number
    name: string
    trade_name?: string
    cnpj: string

    // Endereço
    address?: string
    number?: string
    complement?: string
    district?: string
    city?: string
    state?: string
    zip_code?: string

    // Contato
    email?: string
    phone?: string

    // Dados empresariais
    company_size?: string
    main_activity?: string
    secondary_activity?: string
    legal_nature?: string
    opening_date?: string
    registration_status?: string

    // Configurações
    active?: boolean
    restricted?: boolean
    auto_fetch?: boolean
  } | null
  onSubmit: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const brazilianStates = [
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

export function CompanyForm({ company, onSubmit, onCancel, isLoading }: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consultingCNPJ, setConsultingCNPJ] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: company?.name || "",
      trade_name: company?.trade_name || "",
      cnpj: company?.cnpj || "",

      // Endereço
      address: company?.address || "",
      number: company?.number || "",
      complement: company?.complement || "",
      district: company?.district || "",
      city: company?.city || "",
      state: company?.state || "",
      zip_code: company?.zip_code || "",

      // Contato
      email: company?.email || "",
      phone: company?.phone || "",

      // Dados empresariais
      company_size: company?.company_size || "",
      main_activity: company?.main_activity || "",
      secondary_activity: company?.secondary_activity || "",
      legal_nature: company?.legal_nature || "",
      opening_date: company?.opening_date || "",
      registration_status: company?.registration_status || "",

      // Configurações
      active: company?.active !== undefined ? company.active : true,
      restricted: company?.restricted !== undefined ? company.restricted : false,
      auto_fetch: company?.auto_fetch !== undefined ? company.auto_fetch : false,
    },
  })

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error("Erro ao salvar empresa:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const handleCNPJConsult = async () => {
    const cnpj = cleanCNPJ(watch("cnpj") || "")

    if (!validateCNPJ(cnpj)) {
      alert("CNPJ inválido")
      return
    }

    try {
      setConsultingCNPJ(true)
      const cnpjData: CNPJData = await CompaniesService.consultarCNPJ(cnpj)

      // Preencher formulário com dados do CNPJ
      setValue("name", cnpjData.name)
      setValue("trade_name", cnpjData.trade_name)
      setValue("address", cnpjData.address)
      setValue("number", cnpjData.number)
      setValue("complement", cnpjData.complement)
      setValue("district", cnpjData.district)
      setValue("city", cnpjData.city)
      setValue("state", cnpjData.state)
      setValue("zip_code", cnpjData.zip_code)
      setValue("phone", cnpjData.phone)
      setValue("email", cnpjData.email)
      setValue("company_size", cnpjData.company_size)
      setValue("main_activity", cnpjData.main_activity)
      setValue("legal_nature", cnpjData.legal_nature)
      setValue("opening_date", cnpjData.opening_date)
      setValue("registration_status", cnpjData.registration_status)

      if (cnpjData.secondary_activities && cnpjData.secondary_activities.length > 0) {
        setValue("secondary_activity", cnpjData.secondary_activities.join(", "))
      }

    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao consultar CNPJ")
    } finally {
      setConsultingCNPJ(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {company ? "Editar Empresa" : "Nova Empresa"}
        </CardTitle>
        <CardDescription>
          {company 
            ? "Atualize as informações da empresa" 
            : "Preencha os dados para cadastrar uma nova empresa"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  id="cnpj"
                  {...register("cnpj", {
                    required: "CNPJ é obrigatório",
                    pattern: {
                      value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                      message: "CNPJ deve ter o formato XX.XXX.XXX/XXXX-XX"
                    }
                  })}
                  placeholder="00.000.000/0000-00"
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value)
                    setValue("cnpj", formatted)
                  }}
                  maxLength={18}
                  disabled={!!company} // Não permite editar CNPJ em modo de edição
                />
                {!company && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCNPJConsult}
                    disabled={consultingCNPJ || !watch("cnpj")}
                  >
                    {consultingCNPJ ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {errors.cnpj && (
                <p className="text-sm text-destructive">{errors.cnpj.message || "Erro no CNPJ"}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Razão Social *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Razão social é obrigatória" })}
                  placeholder="Ex: Empresa LTDA"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message || "Erro na razão social"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade_name">Nome Fantasia</Label>
                <Input
                  id="trade_name"
                  {...register("trade_name")}
                  placeholder="Ex: Empresa"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "E-mail inválido"
                    }
                  })}
                  placeholder="contato@empresa.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message || "Erro no e-mail"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="(11) 99999-9999"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setValue("phone", formatted)
                  }}
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Logradouro</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  {...register("number")}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register("complement")}
                  placeholder="Apto, Sala, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Bairro</Label>
                <Input
                  id="district"
                  {...register("district")}
                  placeholder="Nome do bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={watch("state")}
                  onValueChange={(value) => setValue("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  {...register("zip_code")}
                  placeholder="00000-000"
                  onChange={(e) => {
                    const formatted = formatZipCode(e.target.value)
                    setValue("zip_code", formatted)
                  }}
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Dados Empresariais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Empresariais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_size">Porte da Empresa</Label>
                <Input
                  id="company_size"
                  {...register("company_size")}
                  placeholder="ME, EPP, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_nature">Natureza Jurídica</Label>
                <Input
                  id="legal_nature"
                  {...register("legal_nature")}
                  placeholder="Natureza jurídica"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_activity">Atividade Principal</Label>
              <Textarea
                id="main_activity"
                {...register("main_activity")}
                placeholder="Atividade principal da empresa"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_activity">Atividades Secundárias</Label>
              <Textarea
                id="secondary_activity"
                {...register("secondary_activity")}
                placeholder="Atividades secundárias (separadas por vírgula)"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening_date">Data de Abertura</Label>
                <Input
                  id="opening_date"
                  {...register("opening_date")}
                  placeholder="DD/MM/AAAA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_status">Situação Cadastral</Label>
                <Input
                  id="registration_status"
                  {...register("registration_status")}
                  placeholder="ATIVA, SUSPENSA, etc."
                />
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={watch("active")}
                  onCheckedChange={(checked) => setValue("active", checked)}
                />
                <Label htmlFor="active">Empresa ativa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="restricted"
                  checked={watch("restricted")}
                  onCheckedChange={(checked) => setValue("restricted", checked)}
                />
                <Label htmlFor="restricted">Empresa restrita (apenas membros podem acessar)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_fetch"
                  checked={watch("auto_fetch")}
                  onCheckedChange={(checked) => setValue("auto_fetch", checked)}
                />
                <Label htmlFor="auto_fetch">
                  <span className="font-medium">Busca automática de documentos</span>
                  <span className="block text-sm text-muted-foreground">
                    Quando ativado, o sistema buscará automaticamente documentos NFSe desta empresa
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading || isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {(isLoading || isSubmitting) ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
