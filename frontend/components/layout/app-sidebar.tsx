"use client"

import * as React from "react"
import {
  AudioWaveform,
  Building2,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Users,
  History,
  Key,
  FileText,
  User,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@zoomxml.com",
    avatar: "/next.svg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Empresas",
      url: "/companies",
      icon: Building2,
    },
    {
      title: "Credenciais",
      url: "/credentials",
      icon: Key,
    },
    {
      title: "Documentos",
      url: "/documents",
      icon: FileText,
    },
    {
      title: "Membros",
      url: "/members",
      icon: Users,
    },
    {
      title: "Usuários",
      url: "/users",
      icon: User,
    },
    {
      title: "Auditoria",
      url: "/audit",
      icon: History,
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
