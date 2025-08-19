"use client"

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Building2,
  Calendar
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
import {
  DocumentsService,
  type GlobalDocument,
  type DocumentFilters,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  getDocumentTypeLabel,
  formatCurrency,
  formatDate
} from "@/services/documents"

// Função para formatar CNPJ
function formatCNPJ(cnpj: string | undefined): string {
  if (!cnpj) return ""
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

export function GlobalDocumentsContent() {
  const [documents, setDocuments] = useState<GlobalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [filters] = useState<DocumentFilters>({})

  // Definir colunas da tabela
  const columns: ColumnDef<GlobalDocument>[] = [
    {
      accessorKey: "number",
      header: "Número",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("number")}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {getDocumentTypeLabel(row.getValue("type"))}
        </Badge>
      ),
    },
    {
      id: "company",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.company?.name || "N/A"}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.company?.cnpj ? formatCNPJ(row.original.company.cnpj) : "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "taker_name",
      header: "Tomador",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("taker_name")}</div>
          <div className="text-sm text-muted-foreground">
            {formatCNPJ(row.original.taker_cnpj)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Data Emissão",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{formatDate(row.getValue("issue_date"))}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getStatusBadge(row.getValue("status"))
        return (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Upload em",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {new Date(row.getValue("created_at")).toLocaleDateString("pt-BR")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleDownload(row.original)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
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

  const fetchDocuments = async (newFilters: DocumentFilters = {}) => {
    try {
      setLoading(true)
      const response = await DocumentsService.getGlobalDocuments({
        ...filters,
        ...newFilters
      })
      setDocuments(response.documents)
      setTotalDocuments(response.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar documentos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "pending": { variant: "outline", label: "Pendente" },
      "processing": { variant: "secondary", label: "Processando" },
      "processed": { variant: "default", label: "Processado" },
      "error": { variant: "destructive", label: "Erro" }
    }
    return variants[status] || { variant: "outline", label: status }
  }



  const handleDownload = async (doc: GlobalDocument) => {
    try {
      const blob = await DocumentsService.downloadDocument(doc.id)
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.setAttribute("download", `${doc.type}_${doc.number}_${doc.provider_cnpj}.xml`)
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erro ao baixar documento:", err)
    }
  }

  const handleAdd = () => {
    console.log("Adicionar novo documento")
  }

  const handleDelete = async (rows: any[]) => {
    const documentIds = rows.map(row => row.original.id)

    if (!confirm(`Tem certeza que deseja excluir ${documentIds.length} documento(s)?`)) {
      return
    }

    try {
      await DocumentsService.deleteDocuments(documentIds)
      await fetchDocuments() // Reload documents
    } catch (error) {
      console.error("Erro ao excluir documentos:", error)
      alert("Erro ao excluir documentos")
    }
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
          <p className="text-destructive font-medium">Erro ao carregar documentos</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
          <Button onClick={() => fetchDocuments()} className="mt-4">
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
            <FileText className="h-8 w-8" />
            Documentos Globais
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os documentos de todas as empresas em um só lugar
          </p>
        </div>
      </div>



      {/* DataTable */}
      <div className="flex-1 min-w-0 min-h-0">
        <DataTable
          columns={columns}
          data={documents}
          searchKey="number"
          searchPlaceholder="Buscar por número, empresa, CNPJ, tomador..."
          onAdd={handleAdd}
          onDelete={handleDelete}
          addButtonText="Novo Documento"
          deleteButtonText="Excluir Documentos"
          filterableColumns={[
            {
              id: "status",
              title: "Status",
              options: DOCUMENT_STATUS.map(status => ({
                label: status.label,
                value: status.value,
              })),
            },
            {
              id: "type",
              title: "Tipo",
              options: DOCUMENT_TYPES.map(type => ({
                label: type.label,
                value: type.value,
              })),
            },
          ]}
        />

        {/* Informações dos Documentos */}
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando todos os {documents.length} documentos
          </div>
          <div className="text-sm text-muted-foreground">
            Total no banco: {totalDocuments} documentos
          </div>
        </div>
      </div>
    </div>
  )
}
