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
import { CompaniesService, formatCNPJ } from "@/services/companies"
import { CompanyModal } from "@/components/modals/company-modal"
import type { Company } from "@/types/company"

export function CompaniesContent() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined)

  // Definir colunas da tabela
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <div className="font-medium text-xs">{row.getValue("name")}</div>
          {row.original.trade_name && (
            <div className="text-xs text-muted-foreground">
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
        <span className="font-mono text-xs whitespace-nowrap">
          {formatCNPJ(row.getValue("cnpj"))}
        </span>
      ),
    },
    {
      accessorKey: "city",
      header: "Localização",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs">{row.original.city || "Não informado"}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => (
        <div className="space-y-0.5 min-w-[160px]">
          {row.original.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs">{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs">{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("active") ? "default" : "secondary"} className="text-xs px-2 py-0.5">
          {row.getValue("active") ? "Ativa" : "Inativa"}
        </Badge>
      ),
    },
    {
      accessorKey: "auto_fetch",
      header: "Consulta Auto",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("auto_fetch") ? "default" : "outline"}
          className={`text-xs px-2 py-0.5 ${
            row.getValue("auto_fetch")
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {row.getValue("auto_fetch") ? "Ativa" : "Inativa"}
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
        <div className="flex gap-0.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/members`)}
            className="text-xs px-1.5 h-6"
            title="Membros"
          >
            <Users className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/credentials`)}
            className="text-xs px-1.5 h-6"
            title="Credenciais"
          >
            <Key className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/companies/${row.original.id}/documents`)}
            className="text-xs px-1.5 h-6"
            title="Documentos"
          >
            <FileText className="h-3 w-3" />
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

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await CompaniesService.getCompanies()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleAdd = () => {
    router.push("/companies/new")
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setModalOpen(true)
  }

  const handleDelete = async (rows: any[]) => {
    const companies = rows.map(row => row.original)

    if (!confirm(`Tem certeza que deseja excluir ${companies.length} empresa(s)?`)) {
      return
    }

    try {
      await Promise.all(companies.map((company: Company) => CompaniesService.deleteCompany(company.id)))
      await fetchCompanies() // Recarregar lista
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir empresas")
    }
  }

  const handleModalSuccess = () => {
    fetchCompanies() // Recarregar lista após sucesso
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
    <div className="h-full flex flex-col space-y-6 min-w-0">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <span className="truncate">Empresas</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie as empresas cadastradas no sistema
            </p>
          </div>
        </div>
      </div>

      {/* DataTable Container */}
      <div className="flex-1 min-w-0 min-h-0">
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
            {
              id: "auto_fetch",
              title: "Consulta Automática",
              options: [
                { label: "Ativa", value: "true" },
                { label: "Inativa", value: "false" },
              ],
            },
          ]}
        />
      </div>

      {/* Modal de Empresa */}
      <CompanyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        company={editingCompany}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
