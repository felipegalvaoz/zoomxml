"use client"

import { CredentialsContent } from "./credentials-content"

interface CompanyCredentialsContentProps {
  companyId: string
}

export function CompanyCredentialsContent({ companyId }: CompanyCredentialsContentProps) {
  return <CredentialsContent companyId={companyId} />
}
