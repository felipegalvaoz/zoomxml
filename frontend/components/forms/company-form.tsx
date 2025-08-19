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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  layout?: "default" | "split" | "accordion"
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

export function CompanyForm({ company, onSubmit, onCancel, isLoading, layout = "default" }: CompanyFormProps) {
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
      active: company?.active ?? true,
      restricted: company?.restricted ?? false,
      auto_fetch: company?.auto_fetch ?? true,
    },
  })

  // Funções de formatação
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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const handleFormSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCNPJConsult = async () => {
    const cnpj = watch("cnpj")
    if (!cnpj || !validateCNPJ(cnpj)) {
      alert("Por favor, informe um CNPJ válido")
      return
    }

    try {
      setConsultingCNPJ(true)
      const cleanedCNPJ = cleanCNPJ(cnpj)
      const data: CNPJData = await CompaniesService.consultarCNPJ(cleanedCNPJ)

      // Preencher campos automaticamente
      setValue("name", data.name || "")
      setValue("trade_name", data.trade_name || "")
      setValue("address", data.address || "")
      setValue("number", data.number || "")
      setValue("complement", data.complement || "")
      setValue("district", data.district || "")
      setValue("city", data.city || "")
      setValue("state", data.state || "")
      setValue("zip_code", data.zip_code || "")
      setValue("phone", data.phone || "")
      setValue("email", data.email || "")
      setValue("company_size", data.company_size || "")
      setValue("main_activity", data.main_activity || "")
      setValue("secondary_activity", data.secondary_activities?.join(", ") || "")
      setValue("legal_nature", data.legal_nature || "")
      setValue("opening_date", data.opening_date || "")
      setValue("registration_status", data.registration_status || "")

    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao consultar CNPJ")
    } finally {
      setConsultingCNPJ(false)
    }
  }

  if (layout === "accordion") {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic", "contact", "address"]} className="w-full">
          {/* Informações Básicas */}
          <AccordionItem value="basic">
            <AccordionTrigger className="text-lg font-medium">
              Informações Básicas
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
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
                    disabled={!!company}
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
                    {...register("name", { required: "Razão Social é obrigatória" })}
                    placeholder="Nome da empresa"
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
                    placeholder="Nome fantasia"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contato */}
          <AccordionItem value="contact">
            <AccordionTrigger className="text-lg font-medium">
              Contato
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
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
            </AccordionContent>
          </AccordionItem>

          {/* Endereço */}
          <AccordionItem value="address">
            <AccordionTrigger className="text-lg font-medium">
              Endereço
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
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
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select onValueChange={(value) => setValue("state", value)} value={watch("state")}>
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
                      const formatted = formatCEP(e.target.value)
                      setValue("zip_code", formatted)
                    }}
                    maxLength={9}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Dados Empresariais */}
          <AccordionItem value="business">
            <AccordionTrigger className="text-lg font-medium">
              Dados Empresariais
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
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
                  placeholder="Atividades secundárias da empresa"
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
                    placeholder="Situação cadastral"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Credenciais */}
          <AccordionItem value="credentials">
            <AccordionTrigger className="text-lg font-medium">
              Credenciais de Acesso (Opcional)
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  Configure as credenciais de acesso às APIs para busca automática de documentos NFSe.
                  Estas informações são opcionais e podem ser configuradas posteriormente.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credential_name">Nome da Credencial</Label>
                  <Input
                    id="credential_name"
                    placeholder="Ex: Token Prefeitura Imperatriz"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credential_type">Tipo de Credencial</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prefeitura_token">Token da Prefeitura</SelectItem>
                        <SelectItem value="api_key">Chave de API</SelectItem>
                        <SelectItem value="certificate">Certificado Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credential_environment">Ambiente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Produção</SelectItem>
                        <SelectItem value="sandbox">Sandbox/Teste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credential_login">Login/Usuário</Label>
                  <Input
                    id="credential_login"
                    placeholder="Login ou usuário para acesso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credential_secret">Token/Senha</Label>
                  <Input
                    id="credential_secret"
                    type="password"
                    placeholder="Token de acesso ou senha"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta informação será criptografada e armazenada com segurança
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credential_description">Descrição</Label>
                  <Textarea
                    id="credential_description"
                    placeholder="Descrição adicional sobre esta credencial"
                    rows={2}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configurações */}
          <AccordionItem value="settings">
            <AccordionTrigger className="text-lg font-medium">
              Configurações
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={watch("active")}
                    onCheckedChange={(checked) => setValue("active", checked)}
                  />
                  <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Empresa ativa
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="restricted"
                    checked={watch("restricted")}
                    onCheckedChange={(checked) => setValue("restricted", checked)}
                  />
                  <Label htmlFor="restricted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Empresa restrita (apenas membros podem acessar)
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Switch
                    id="auto_fetch"
                    checked={watch("auto_fetch")}
                    onCheckedChange={(checked) => setValue("auto_fetch", checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="auto_fetch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Busca automática de documentos
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Quando ativado, o sistema buscará automaticamente documentos NFSe desta empresa
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    )
  }

  // Layout padrão (modal)
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Layout padrão não implementado para esta versão</p>
    </div>
  )
}
