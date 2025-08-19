"use client"

import { CompanyDocumentsContent } from "@/components/pages/company-documents-content"
import { use } from "react"

interface CompanyDocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CompanyDocumentsPage({ params }: CompanyDocumentsPageProps) {
  const { id } = use(params)
  return <CompanyDocumentsContent companyId={id} />
}
