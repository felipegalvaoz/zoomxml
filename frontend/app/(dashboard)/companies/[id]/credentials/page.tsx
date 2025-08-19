"use client"

import { CompanyCredentialsContent } from "@/components/pages/company-credentials-content"
import { use } from "react"

interface CompanyCredentialsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CompanyCredentialsPage({ params }: CompanyCredentialsPageProps) {
  const { id } = use(params)
  return <CompanyCredentialsContent companyId={id} />
}
