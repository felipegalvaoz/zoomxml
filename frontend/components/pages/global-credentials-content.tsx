"use client"

import { useEffect, useState } from "react"
import { 
  Key, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { backendApiCall } from "@/lib/auth"

interface GlobalCredential {
  id: number
  company_id: number
  type: string
  name: string
  description?: string
  login?: string
  environment?: string
  active: boolean
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

export function GlobalCredentialsContent() {
  const [credentials, setCredentials] = useState<GlobalCredential[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<GlobalCredential | null>(null)
  
  // Password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())

  const fetchCredentials = async (page = 1) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCompany !== "all") params.append("company_id", selectedCompany)
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedEnvironment !== "all") params.append("environment", selectedEnvironment)
      if (selectedStatus !== "all") params.append("active", selectedStatus === "active" ? "true" : "false")
      
      const response = await backendApiCall<GlobalCredential[]>(`/api/credentials?${params}`)
      setCredentials(response || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar credenciais")
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
  }, [])

  useEffect(() => {
    fetchCredentials(currentPage)
  }, [currentPage, searchTerm, selectedCompany, selectedType, selectedEnvironment, selectedStatus])

  const getCredentialTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "prefeitura_user_pass": "Usuário/Senha",
      "prefeitura_token": "Token",
      "prefeitura_mixed": "Misto"
    }
    return types[type] || type
  }

  const getCredentialTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "prefeitura_user_pass": "default",
      "prefeitura_token": "secondary", 
      "prefeitura_mixed": "outline"
    }
    return variants[type] || "default"
  }

  const getEnvironmentBadge = (environment?: string) => {
    if (!environment) return "outline"
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "production": "destructive",
      "staging": "secondary",
      "development": "outline"
    }
    return variants[environment] || "outline"
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCompany("all")
    setSelectedType("all")
    setSelectedEnvironment("all")
    setSelectedStatus("all")
    setCurrentPage(1)
  }

  if (loading && credentials.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Key className="h-8 w-8" />
            Credenciais Globais
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as credenciais de todas as empresas em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchCredentials(currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Credencial
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar credenciais específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Company Filter */}
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {Array.isArray(companies) && companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="prefeitura_user_pass">Usuário/Senha</SelectItem>
                <SelectItem value="prefeitura_token">Token</SelectItem>
                <SelectItem value="prefeitura_mixed">Misto</SelectItem>
              </SelectContent>
            </Select>

            {/* Environment Filter */}
            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger>
                <SelectValue placeholder="Ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os ambientes</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
                <SelectItem value="staging">Homologação</SelectItem>
                <SelectItem value="development">Desenvolvimento</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              {credentials.length} credencial(is) encontrada(s)
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Credenciais</CardTitle>
          <CardDescription>
            Todas as credenciais cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Erro ao carregar credenciais: {error}</p>
              <Button onClick={() => fetchCredentials(currentPage)} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma credencial encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ajuste os filtros ou adicione uma nova credencial
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-[70px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{credential.name}</div>
                          {credential.description && (
                            <div className="text-sm text-muted-foreground">
                              {credential.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{credential.company.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCNPJ(credential.company.cnpj)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCredentialTypeBadge(credential.type)}>
                          {getCredentialTypeLabel(credential.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {credential.login ? (
                          <span className="font-mono text-sm">{credential.login}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {credential.environment ? (
                          <Badge variant={getEnvironmentBadge(credential.environment)}>
                            {credential.environment}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={credential.active ? "default" : "secondary"}>
                          {credential.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(credential.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCredential(credential)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCredential(credential)
                                setShowDeleteDialog(true)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
