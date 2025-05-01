"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Search, Settings, Shield, ThumbsUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Missing Data Check", href: "/missing-data", icon: FileText },
  { name: "Data Duplication Check", href: "/data-duplication", icon: Search },
  { name: "Compliance Check", href: "/compliance", icon: Shield },
  { name: "Guideline Check", href: "/guideline", icon: ThumbsUp },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 px-3 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#7C3AED]" />
              <span className="text-lg font-semibold text-[#1F2937]">InsureFlow</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-gray-50 pl-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn("flex items-center gap-3", pathname === item.href && "bg-[#F3F0FF] text-[#7C3AED]")}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">John Doe</span>
                <span className="text-xs text-gray-500">Underwriter</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Settings className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-[#1F2937]">
                {navigationItems.find((item) => item.href === pathname)?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Team</span>
              </Button>
              <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9] gap-2">
                <FileText className="h-4 w-4" />
                <span>New Submission</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
