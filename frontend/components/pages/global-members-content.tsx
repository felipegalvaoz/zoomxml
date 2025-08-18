"use client"

import { useEffect, useState } from "react"
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Filter,
  UserPlus,
  RefreshCw,
  Shield,
  User
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

interface GlobalMember {
  id: number
  user_id: number
  company_id: number
  role: string
  permissions: string[]
  active: boolean
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
    active: boolean
  }
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

interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export function GlobalMembersContent() {
  const [members, setMembers] = useState<GlobalMember[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<GlobalMember | null>(null)

  const fetchMembers = async (page = 1) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCompany !== "all") params.append("company_id", selectedCompany)
      if (selectedRole !== "all") params.append("role", selectedRole)
      if (selectedStatus !== "all") params.append("active", selectedStatus === "active" ? "true" : "false")
      
      const response = await backendApiCall<GlobalMember[]>(`/api/members?${params}`)
      setMembers(response || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar membros")
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

  const fetchUsers = async () => {
    try {
      const response = await backendApiCall<User[]>("/api/users")
      setUsers(response || [])
    } catch (err) {
      console.error("Erro ao carregar usuários:", err)
    }
  }

  useEffect(() => {
    fetchCompanies()
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchMembers(currentPage)
  }, [currentPage, searchTerm, selectedCompany, selectedRole, selectedStatus])

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      "admin": "Administrador",
      "manager": "Gerente",
      "editor": "Editor",
      "viewer": "Visualizador"
    }
    return roles[role] || role
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "admin": "destructive",
      "manager": "default",
      "editor": "secondary",
      "viewer": "outline"
    }
    return variants[role] || "outline"
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />
      case "manager":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCompany("all")
    setSelectedRole("all")
    setSelectedStatus("all")
    setCurrentPage(1)
  }

  // Group members by user to show multiple companies
  const groupedMembers = members.reduce((acc, member) => {
    const userId = member.user.id
    if (!acc[userId]) {
      acc[userId] = {
        user: member.user,
        memberships: []
      }
    }
    acc[userId].memberships.push({
      id: member.id,
      company: member.company,
      role: member.role,
      active: member.active,
      created_at: member.created_at
    })
    return acc
  }, {} as Record<number, { user: any, memberships: any[] }>)

  if (loading && members.length === 0) {
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
            <Users className="h-8 w-8" />
            Membros Globais
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os membros de todas as empresas em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchMembers(currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar membros específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
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

            {/* Role Filter */}
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
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
              {Object.keys(groupedMembers).length} usuário(s) com {members.length} associação(ões) encontrada(s)
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>
            Todos os membros cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Erro ao carregar membros: {error}</p>
              <Button onClick={() => fetchMembers(currentPage)} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : Object.keys(groupedMembers).length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum membro encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ajuste os filtros ou adicione um novo membro
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Empresas</TableHead>
                    <TableHead>Status do Usuário</TableHead>
                    <TableHead>Primeira Associação</TableHead>
                    <TableHead className="w-[70px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(groupedMembers).map((group) => (
                    <TableRow key={group.user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{group.user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {group.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {group.memberships.map((membership, index) => (
                            <div key={membership.id} className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {membership.company.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(membership.role)}
                                <Badge variant={getRoleBadge(membership.role)} className="text-xs">
                                  {getRoleLabel(membership.role)}
                                </Badge>
                              </div>
                              {!membership.active && (
                                <Badge variant="secondary" className="text-xs">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={group.user.active ? "default" : "secondary"}>
                          {group.user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          Math.min(...group.memberships.map(m => new Date(m.created_at).getTime()))
                        ).toLocaleDateString("pt-BR")}
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Usuário
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Adicionar à Empresa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {group.memberships.map((membership) => (
                              <DropdownMenuItem
                                key={membership.id}
                                onClick={() => {
                                  // Find the full member object for this membership
                                  const fullMember = members.find(m => m.id === membership.id)
                                  if (fullMember) {
                                    setSelectedMember(fullMember)
                                    setShowRemoveDialog(true)
                                  }
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover de {membership.company.name}
                              </DropdownMenuItem>
                            ))}
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
