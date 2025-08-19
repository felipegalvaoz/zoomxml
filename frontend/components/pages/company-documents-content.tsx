"use client"

import { DocumentsContent } from "./documents-content"

interface CompanyDocumentsContentProps {
  companyId: string
}

export function CompanyDocumentsContent({ companyId }: CompanyDocumentsContentProps) {
  return <DocumentsContent companyId={companyId} />
}
