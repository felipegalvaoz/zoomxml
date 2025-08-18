"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { 
  Building2, 
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  Key,
  FileText
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { backendApiCall } from "@/lib/auth"

interface Company {
  id: number
  name: string
  trade_name?: string
  cnpj: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  active: boolean
  restricted?: boolean
  auto_fetch?: boolean
  created_at: string
  updated_at: string
}

interface CompaniesResponse {
  companies: Company[]
  pagination: {
    total: number
    page: number
    limit: number
  }
}

export function CompaniesContent() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Definir colunas da tabela
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Empresa",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.trade_name && (
            <div className="text-sm text-muted-foreground">
              {row.original.trade_name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatCNPJ(row.getValue("cnpj"))}
        </span>
      ),
    },
    {
      accessorKey: "city",
      header: "Localização",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.city || "Não informado"}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("active") ? "default" : "secondary"}>
          {row.getValue("active") ? "Ativa" : "Inativa"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Criado em",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
      header: "Ações Rápidas",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/members`)}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Membros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/credentials`)}
            className="text-xs"
          >
            <Key className="h-3 w-3 mr-1" />
            Credenciais
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/documents`)}
            className="text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            Documentos
          </Button>
        </div>
      ),
    },
    {
      id: "menu",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await backendApiCall<CompaniesResponse>("/api/companies")
      setCompanies(response.companies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar empresas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleAdd = () => {
    console.log("Adicionar nova empresa")
  }

  const handleDelete = (rows: any[]) => {
    console.log("Excluir empresas:", rows)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
          <p className="text-destructive font-medium">Erro ao carregar empresas</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
          <Button onClick={() => fetchCompanies()} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Empresas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={companies}
        searchKey="name"
        searchPlaceholder="Buscar por nome, CNPJ ou cidade..."
        onAdd={handleAdd}
        onDelete={handleDelete}
        addButtonText="Nova Empresa"
        deleteButtonText="Excluir Empresas"
        filterableColumns={[
          {
            id: "active",
            title: "Status",
            options: [
              { label: "Ativa", value: "true" },
              { label: "Inativa", value: "false" },
            ],
          },
        ]}
      />
    </div>
  )
}
