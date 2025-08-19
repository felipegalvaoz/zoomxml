"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import {
  Key,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
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
import { CredentialModal } from "@/components/modals/credential-modal"
import { CREDENTIAL_TYPES } from "@/types/credential"
import type { Credential } from "@/types/credential"

interface GlobalCredential extends Credential {
  company?: {
    id: number
    name: string
    cnpj: string
  }
}

export function GlobalCredentialsContent() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<GlobalCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<GlobalCredential | undefined>(undefined)

  // Define table columns for global view
  const columns: ColumnDef<GlobalCredential>[] = [
    {
      accessorKey: "company.name",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-xs flex items-center gap-2">
            <Building2 className="h-3 w-3" />
            {row.original.company?.name || "N/A"}
          </div>
          {row.original.company?.cnpj && (
            <div className="text-xs text-muted-foreground">
              CNPJ: {row.original.company.cnpj}
            </div>
          )}
        </div>
      ),
    },
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
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const typeObj = CREDENTIAL_TYPES.find(t => t.value === type)
        return (
          <Badge variant="outline" className="text-xs">
            {typeObj?.label || type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "environment",
      header: "Ambiente",
      cell: ({ row }) => {
        const env = row.getValue("environment") as string
        if (!env) return <span className="text-muted-foreground text-xs">-</span>
        
        const variant = env === "production" ? "destructive" : 
                      env === "staging" ? "secondary" : "default"
        
        return (
          <Badge variant={variant} className="text-xs">
            {env}
          </Badge>
        )
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("active") ? "default" : "secondary"} className="text-xs">
          {row.getValue("active") ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Criado em",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex gap-0.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.company_id}/credentials`)}
            className="text-xs px-1.5 h-6"
            title="Ver na Empresa"
          >
            <Building2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      id: "menu",
      header: "",
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

  const fetchGlobalCredentials = async () => {
    try {
      setLoading(true)
      // TODO: Implementar endpoint para buscar credenciais globais
      // Por enquanto, vamos simular dados vazios
      setCredentials([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar credenciais")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalCredentials()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleAdd = () => {
    setEditingCredential(undefined)
    setModalOpen(true)
  }

  const handleEdit = (credential: GlobalCredential) => {
    setEditingCredential(credential)
    setModalOpen(true)
  }

  const handleDelete = async (rows: any[]) => {
    const credentials = rows.map(row => row.original)

    if (!confirm(`Tem certeza que deseja excluir ${credentials.length} credencial(is)?`)) {
      return
    }

    try {
      // TODO: Implementar exclusão de credenciais globais
      await fetchGlobalCredentials() // Reload list
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir credenciais")
    }
  }

  const handleModalSuccess = () => {
    fetchGlobalCredentials() // Reload list after success
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">Erro ao carregar credenciais</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
          <Button onClick={() => fetchGlobalCredentials()} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
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
              <span className="truncate">Credenciais Globais</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Visualize e gerencie todas as credenciais do sistema
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
          searchPlaceholder="Buscar por nome, tipo ou empresa..."
          onAdd={handleAdd}
          onDelete={handleDelete}
          addButtonText="Nova Credencial"
          deleteButtonText="Excluir Credenciais"
          filterableColumns={[
            {
              id: "type",
              title: "Tipo",
              options: CREDENTIAL_TYPES.map(type => ({
                label: type.label,
                value: type.value,
              })),
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
            {
              id: "active",
              title: "Status",
              options: [
                { label: "Ativo", value: "true" },
                { label: "Inativo", value: "false" },
              ],
            },
          ]}
        />
      </div>

      {/* Modal de Credencial */}
      <CredentialModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        companyId={editingCredential?.company_id}
        credential={editingCredential}
        onSuccess={handleModalSuccess}
        showCompanySelect={!editingCredential} // Mostrar select apenas para novas credenciais
      />
    </div>
  )
}
