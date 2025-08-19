"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CredentialsService } from "@/services/credentials"
import { CompaniesService } from "@/services/companies"
import { CREDENTIAL_TYPES, ENVIRONMENT_OPTIONS } from "@/types/credential"
import type { Credential, CreateCredentialRequest, UpdateCredentialRequest } from "@/types/credential"
import { Loader2, Eye, EyeOff } from "lucide-react"

const createCredentialSchema = (showCompanySelect: boolean) => z.object({
  company_id: showCompanySelect ? z.number().min(1, "Empresa é obrigatória") : z.number().optional(),
  type: z.string().min(1, "Tipo é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255, "Nome deve ter no máximo 255 caracteres"),
  description: z.string().optional(),
  login: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
  environment: z.string().optional(),
  active: z.boolean(),
})

type CredentialFormData = z.infer<ReturnType<typeof createCredentialSchema>>

interface CredentialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId?: number // Opcional para uso global
  credential?: Credential
  onSuccess: () => void
  showCompanySelect?: boolean // Para mostrar select de empresa
}

export function CredentialModal({
  open,
  onOpenChange,
  companyId,
  credential,
  onSuccess,
  showCompanySelect = false,
}: CredentialModalProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [companies, setCompanies] = useState<Array<{id: number, name: string, cnpj: string}>>([])
  const isEditing = !!credential

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(createCredentialSchema(showCompanySelect)),
    defaultValues: {
      company_id: companyId,
      type: "",
      name: "",
      description: "",
      login: "",
      password: "",
      token: "",
      environment: "",
      active: true,
    },
  })

  const selectedType = form.watch("type")

  // Load companies when showCompanySelect is true
  useEffect(() => {
    if (showCompanySelect && open) {
      const loadCompanies = async () => {
        try {
          const response = await CompaniesService.getCompanies()
          setCompanies(response.companies.map(company => ({
            id: company.id,
            name: company.name,
            cnpj: company.cnpj
          })))
        } catch (error) {
          console.error("Erro ao carregar empresas:", error)
          // Fallback para dados mockados em caso de erro
          setCompanies([
            { id: 1, name: "Empresa Exemplo 1", cnpj: "12.345.678/0001-90" },
            { id: 2, name: "Empresa Exemplo 2", cnpj: "98.765.432/0001-10" },
          ])
        }
      }
      loadCompanies()
    }
  }, [showCompanySelect, open])

  // Reset form when modal opens/closes or credential changes
  useEffect(() => {
    if (open) {
      if (credential) {
        form.reset({
          company_id: credential.company_id,
          type: credential.type,
          name: credential.name,
          description: credential.description || "",
          login: credential.login || "",
          password: "", // Don't populate password for security
          token: "", // Don't populate token for security
          environment: credential.environment || "",
          active: credential.active,
        })
      } else {
        form.reset({
          company_id: companyId,
          type: "",
          name: "",
          description: "",
          login: "",
          password: "",
          token: "",
          environment: "",
          active: true,
        })
      }
    }
  }, [open, credential, form])

  const onSubmit = async (data: CredentialFormData) => {
    try {
      setLoading(true)

      if (isEditing && credential) {
        // Update credential
        const updateData: UpdateCredentialRequest = {
          name: data.name,
          description: data.description || undefined,
          login: data.login || undefined,
          environment: data.environment || undefined,
          active: data.active,
        }

        // Only include password/token if they were provided
        if (data.password) {
          updateData.password = data.password
        }
        if (data.token) {
          updateData.token = data.token
        }

        const targetCompanyId = showCompanySelect ? credential.company_id : companyId

        if (!targetCompanyId) {
          throw new Error("Company ID is required")
        }

        if (!credential.id) {
          throw new Error("Credential ID is required")
        }



        await CredentialsService.updateCredential(targetCompanyId, credential.id, updateData)
      } else {
        // Create credential
        const createData: CreateCredentialRequest = {
          type: data.type,
          name: data.name,
          description: data.description || undefined,
          login: data.login || undefined,
          password: data.password || undefined,
          token: data.token || undefined,
          environment: data.environment || undefined,
        }

        const targetCompanyId = showCompanySelect ? data.company_id : companyId

        if (!targetCompanyId) {
          throw new Error("Company ID is required")
        }

        await CredentialsService.createCredential(targetCompanyId, createData)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving credential:", error)
      // TODO: Add proper error handling/toast
    } finally {
      setLoading(false)
    }
  }

  const requiresLogin = selectedType === "prefeitura_user_pass" || selectedType === "prefeitura_mixed"
  const requiresPassword = selectedType === "prefeitura_user_pass" || selectedType === "prefeitura_mixed"
  const requiresToken = selectedType === "prefeitura_token" || selectedType === "prefeitura_mixed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Credencial" : "Nova Credencial"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações da credencial." 
              : "Adicione uma nova credencial de acesso para a empresa."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isEditing} // Don't allow changing type when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de credencial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CREDENTIAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Selection - Only show when showCompanySelect is true */}
            {showCompanySelect && (
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{company.name}</span>
                              <span className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da credencial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição opcional da credencial"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Login - only show if type requires it */}
            {requiresLogin && (
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login {requiresLogin ? "*" : ""}</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome de usuário/login" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Password - only show if type requires it */}
            {requiresPassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Senha {requiresPassword && !isEditing ? "*" : ""}
                      {isEditing && " (deixe em branco para manter a atual)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Token - only show if type requires it */}
            {requiresToken && (
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Token {requiresToken && !isEditing ? "*" : ""}
                      {isEditing && " (deixe em branco para manter o atual)"}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showToken ? "text" : "password"}
                          placeholder={isEditing ? "Novo token (opcional)" : "Token de acesso"}
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Environment */}
            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENVIRONMENT_OPTIONS.map((env) => (
                        <SelectItem key={env.value} value={env.value}>
                          {env.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active - only show when editing */}
            {isEditing && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Credencial ativa e disponível para uso
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
