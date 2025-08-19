"use client"

import { MembersContent } from "./members-content"

interface CompanyMembersContentProps {
  companyId: string
}

export function CompanyMembersContent({ companyId }: CompanyMembersContentProps) {
  return <MembersContent companyId={companyId} />
}
