"use client"

import { CompanyMembersContent } from "@/components/pages/company-members-content"
import { use } from "react"

interface CompanyMembersPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CompanyMembersPage({ params }: CompanyMembersPageProps) {
  const { id } = use(params)
  return <CompanyMembersContent companyId={id} />
}
