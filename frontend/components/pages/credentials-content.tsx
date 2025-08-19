"use client"

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  Key,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { CredentialsService, getCredentialTypeLabel, getCredentialTypeBadgeVariant, getEnvironmentLabel } from "@/services/credentials"
import { CredentialModal } from "@/components/modals/credential-modal"
import type { Credential } from "@/types/credential"

interface CredentialsContentProps {
  companyId?: string
}

export function CredentialsContent({ companyId }: CredentialsContentProps = {}) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | undefined>(undefined)

  // Define table columns
  const columns: ColumnDef<Credential>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-xs">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={getCredentialTypeBadgeVariant(row.getValue("type"))} className="text-xs px-2 py-0.5">
          {getCredentialTypeLabel(row.getValue("type"))}
        </Badge>
      ),
    },
    {
      accessorKey: "login",
      header: "Login",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.login || "-"}
        </span>
      ),
    },
    {
      accessorKey: "environment",
      header: "Ambiente",
      cell: ({ row }) => (
        row.original.environment ? (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {getEnvironmentLabel(row.original.environment)}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("active") ? "default" : "secondary"}
          className={`text-xs px-2 py-0.5 ${
            row.getValue("active")
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {row.getValue("active") ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </>
          ) : (
            "Inativo"
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Criado em",
      cell: ({ row }) => (
        <span className="text-xs">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)} className="text-xs">
              <Edit className="h-3 w-3 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive text-xs"
              onClick={() => handleDelete([row])}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const fetchCredentials = async () => {
    if (!companyId) {
      setError("ID da empresa não fornecido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await CredentialsService.getCredentials(parseInt(companyId))

      setCredentials(response || [])

      // Fetch company info (you might want to add this to the service)
      // For now, we'll skip this since we have the company ID

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar credenciais")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredentials()
  }, [companyId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleAdd = () => {
    setEditingCredential(undefined)
    setModalOpen(true)
  }

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential)
    setModalOpen(true)
  }

  const handleDelete = async (rows: any[]) => {
    const credentials = rows.map(row => row.original)

    if (!confirm(`Tem certeza que deseja excluir ${credentials.length} credencial(is)?`)) {
      return
    }

    try {
      await Promise.all(credentials.map((credential: Credential) =>
        CredentialsService.deleteCredential(parseInt(companyId!), credential.id)
      ))
      await fetchCredentials() // Reload list
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir credenciais")
    }
  }

  const handleModalSuccess = () => {
    fetchCredentials() // Reload list after success
  }

  if (!companyId) {
    return (
      <div className="h-full flex flex-col space-y-6 min-w-0">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">ID da empresa não fornecido</p>
            <p className="text-muted-foreground text-sm mt-2">
              Selecione uma empresa para gerenciar suas credenciais
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-6 min-w-0">
        <div className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
        <Skeleton className="flex-1 min-h-[400px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col space-y-6 min-w-0">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">Erro ao carregar credenciais</p>
            <p className="text-muted-foreground text-sm mt-2">{error}</p>
            <Button
              onClick={() => fetchCredentials()}
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6 min-w-0">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <span className="truncate">Credenciais</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie as credenciais de acesso da empresa
            </p>
          </div>
        </div>
      </div>

      {/* DataTable Container */}
      <div className="flex-1 min-w-0 min-h-0">
        <DataTable
          columns={columns}
          data={credentials}
          searchKey="name"
          searchPlaceholder="Buscar por nome, tipo ou login..."
          onAdd={handleAdd}
          onDelete={handleDelete}
          addButtonText="Nova Credencial"
          deleteButtonText="Excluir Credenciais"
          filterableColumns={[
            {
              id: "type",
              title: "Tipo",
              options: [
                { label: "Usuário/Senha", value: "prefeitura_user_pass" },
                { label: "Token", value: "prefeitura_token" },
                { label: "Misto", value: "prefeitura_mixed" },
              ],
            },
            {
              id: "active",
              title: "Status",
              options: [
                { label: "Ativo", value: "true" },
                { label: "Inativo", value: "false" },
              ],
            },
            {
              id: "environment",
              title: "Ambiente",
              options: [
                { label: "Produção", value: "production" },
                { label: "Homologação", value: "staging" },
                { label: "Desenvolvimento", value: "development" },
              ],
            },
          ]}
        />
      </div>

      {/* Credential Modal */}
      <CredentialModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        companyId={parseInt(companyId)}
        credential={editingCredential}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
