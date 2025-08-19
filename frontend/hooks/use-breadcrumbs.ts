"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage?: boolean
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Empresas",
  credentials: "Credenciais",
  documents: "Documentos",
  members: "Membros",
  users: "Usuários",
  audit: "Auditoria",
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always start with Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isCurrentPage: pathname === "/dashboard"
    })

    // Build breadcrumbs from path segments
    let currentPath = ""
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      
      // Skip dashboard since we already added it
      if (segment === "dashboard") continue
      
      // Check if it's a dynamic route (UUID or number)
      const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/.test(segment)
      
      if (isId) {
        // For ID segments, use the previous segment's label + "Detalhes"
        const prevSegment = segments[i - 1]
        const label = routeLabels[prevSegment] ? `${routeLabels[prevSegment]} - Detalhes` : "Detalhes"
        breadcrumbs.push({
          label,
          href: currentPath,
          isCurrentPage: i === segments.length - 1
        })
      } else {
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbs.push({
          label,
          href: currentPath,
          isCurrentPage: i === segments.length - 1
        })
      }
    }

    return breadcrumbs
  }, [pathname])
}
