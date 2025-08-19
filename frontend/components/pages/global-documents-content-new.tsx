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
  Calendar,
  HardDrive,
  Upload
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
import { backendApiCall } from "@/lib/auth"

interface GlobalDocument {
  id: number
  company_id: number
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  status: "pending" | "processing" | "processed" | "error"
  created_at: string
  updated_at: string
  company: {
    id: number
    name: string
    cnpj: string
    trade_name?: string
  }
}

interface Company {
  id: number
  name: string
  cnpj: string
  trade_name?: string
}

export function GlobalDocumentsContent() {
  const [documents, setDocuments] = useState<GlobalDocument[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Definir colunas da tabela
  const columns: ColumnDef<GlobalDocument>[] = [
    {
      accessorKey: "original_name",
      header: "Nome do Arquivo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("original_name")}</div>
            {row.original.name !== row.original.original_name && (
              <div className="text-sm text-muted-foreground">
                {row.original.name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Empresa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.company.name}</div>
            <div className="text-sm text-muted-foreground">
              {formatCNPJ(row.original.company.cnpj)}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "mime_type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {getFileTypeFromMime(row.getValue("mime_type"))}
        </Badge>
      ),
    },
    {
      accessorKey: "file_size",
      header: "Tamanho",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <HardDrive className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{formatFileSize(row.getValue("file_size"))}</span>
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

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await backendApiCall<GlobalDocument[]>("/api/documents")
      setDocuments(response || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar documentos")
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await backendApiCall<Company[]>("/api/companies")
      setCompanies(response || [])
    } catch (err) {
      console.error("Erro ao carregar empresas:", err)
    }
  }

  useEffect(() => {
    fetchCompanies()
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const getFileTypeFromMime = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "PDF"
    if (mimeType.includes("xml")) return "XML"
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "Excel"
    if (mimeType.includes("word") || mimeType.includes("document")) return "Word"
    if (mimeType.includes("image")) return "Imagem"
    return "Arquivo"
  }

  const handleDownload = async (doc: GlobalDocument) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao baixar documento')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.setAttribute("download", doc.original_name)
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

  const handleDelete = (rows: any[]) => {
    console.log("Excluir documentos:", rows)
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
      <DataTable
        columns={columns}
        data={documents || []}
        searchKey="original_name"
        searchPlaceholder="Buscar por nome do arquivo..."
        onAdd={handleAdd}
        onDelete={handleDelete}
        addButtonText="Novo Documento"
        deleteButtonText="Excluir Documentos"
        filterableColumns={[
          {
            id: "status",
            title: "Status",
            options: [
              { label: "Pendente", value: "pending" },
              { label: "Processando", value: "processing" },
              { label: "Processado", value: "processed" },
              { label: "Erro", value: "error" },
            ],
          },
        ]}
      />
    </div>
  )
}
