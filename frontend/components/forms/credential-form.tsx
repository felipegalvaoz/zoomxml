"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

const credentialSchema = z.object({
  type: z.enum(["prefeitura_user_pass", "prefeitura_token", "prefeitura_mixed"], {
    message: "Tipo é obrigatório",
  }),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255, "Nome muito longo"),
  description: z.string().optional(),
  login: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
  environment: z.enum(["production", "staging", "development"]).optional(),
  active: z.boolean().optional().default(true),
})

type CredentialFormData = z.infer<typeof credentialSchema>

interface CredentialFormProps {
  credential?: {
    id: number
    type: string
    name: string
    description?: string
    login?: string
    environment?: string
    active?: boolean
  } | null
  onSubmit: (data: CredentialFormData) => Promise<void>
  onCancel: () => void
}

export function CredentialForm({ credential, onSubmit, onCancel }: CredentialFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: (credential?.type as any) || "prefeitura_user_pass",
      name: credential?.name || "",
      description: credential?.description || "",
      login: credential?.login || "",
      environment: (credential?.environment as any) || "production",
      active: credential?.active !== undefined ? credential.active : true,
    },
  })

  const selectedType = watch("type")

  const handleFormSubmit = async (data: CredentialFormData) => {
    try {
      setLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar credencial")
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "prefeitura_user_pass": "Usuário/Senha",
      "prefeitura_token": "Token",
      "prefeitura_mixed": "Misto (Usuário + Token)"
    }
    return types[type] || type
  }

  const shouldShowLogin = selectedType === "prefeitura_user_pass" || selectedType === "prefeitura_mixed"
  const shouldShowPassword = selectedType === "prefeitura_user_pass" || selectedType === "prefeitura_mixed"
  const shouldShowToken = selectedType === "prefeitura_token" || selectedType === "prefeitura_mixed"

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Tipo */}
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Credencial *</Label>
        <Select
          value={watch("type")}
          onValueChange={(value) => setValue("type", value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prefeitura_user_pass">
              {getTypeLabel("prefeitura_user_pass")}
            </SelectItem>
            <SelectItem value="prefeitura_token">
              {getTypeLabel("prefeitura_token")}
            </SelectItem>
            <SelectItem value="prefeitura_mixed">
              {getTypeLabel("prefeitura_mixed")}
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{String(errors.type.message) || "Erro no tipo"}</p>
        )}
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Ex: Prefeitura São Paulo"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message || "Erro no nome"}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição opcional da credencial"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message || "Erro na descrição"}</p>
        )}
      </div>

      {/* Login (condicional) */}
      {shouldShowLogin && (
        <div className="space-y-2">
          <Label htmlFor="login">Login/Usuário</Label>
          <Input
            id="login"
            {...register("login")}
            placeholder="Nome de usuário"
          />
          {errors.login && (
            <p className="text-sm text-destructive">{errors.login.message || "Erro no login"}</p>
          )}
        </div>
      )}

      {/* Senha (condicional) */}
      {shouldShowPassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password" as any)}
              placeholder="Senha de acesso"
              className="pr-10"
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
          {(errors as any).password && (
            <p className="text-sm text-destructive">{String((errors as any).password.message) || "Erro na senha"}</p>
          )}
        </div>
      )}

      {/* Token (condicional) */}
      {shouldShowToken && (
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <div className="relative">
            <Textarea
              id="token"
              {...register("token" as any)}
              placeholder="Token de acesso"
              rows={3}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {(errors as any).token && (
            <p className="text-sm text-destructive">{String((errors as any).token.message) || "Erro no token"}</p>
          )}
        </div>
      )}

      {/* Ambiente */}
      <div className="space-y-2">
        <Label htmlFor="environment">Ambiente</Label>
        <Select
          value={watch("environment") || "production"}
          onValueChange={(value) => setValue("environment", value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o ambiente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">Produção</SelectItem>
            <SelectItem value="staging">Homologação</SelectItem>
            <SelectItem value="development">Desenvolvimento</SelectItem>
          </SelectContent>
        </Select>
        {errors.environment && (
          <p className="text-sm text-destructive">{String(errors.environment.message) || "Erro no ambiente"}</p>
        )}
      </div>

      {/* Status Ativo */}
      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={watch("active")}
          onCheckedChange={(checked) => setValue("active", checked)}
        />
        <Label htmlFor="active">Credencial ativa</Label>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : credential ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  )
}
