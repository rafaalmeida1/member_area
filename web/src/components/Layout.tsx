"use client"

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/NotificationDropdown"
import { Home, User, LogOut, FileText, Mail, Users, ArrowLeft, ChevronLeft, ChevronRight, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showSidebar?: boolean
  showBackButton?: boolean
  onBack?: () => void
}

export function Layout({ children, title, showSidebar = true, showBackButton = false, onBack }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const handleLogout = () => {
    logout()
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Layout sem sidebar (para páginas de login, registro, etc.)
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              {showBackButton && onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-muted">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    )
  }

  const navigationItems = [
    {
      href: "/",
      icon: Home,
      label: "Início",
      active: pathname === "/",
    },
    ...(user?.role === "PROFESSIONAL"
      ? [
          {
            href: "/modules",
            icon: FileText,
            label: "Módulos",
            active: pathname === "/modules",
          },
          {
            href: "/patients",
            icon: Users,
            label: "Pacientes",
            active: pathname === "/patients",
          },
          {
            href: "/invites",
            icon: Mail,
            label: "Convites",
            active: pathname === "/invites",
          },
          {
            href: "/my-links",
            icon: Link2,
            label: "Meus Links",
            active: pathname === "/my-links",
          },
        ]
      : []),
    {
      href: "/profile",
      icon: User,
      label: "Minha Conta",
      active: pathname === "/profile",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
             {/* Sidebar */}
       <aside
         className={cn(
           "fixed top-0 left-0 h-full bg-[--color-surface] border-r border-[--color-border] transition-all duration-300 z-30 flex flex-col shadow-lg",
           sidebarCollapsed ? "w-20" : "w-72",
         )}
       >
         {/* Header */}
         <div className="px-6 py-3 bg-[--color-primary]">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                 <FileText className="w-5 h-5 text-[--color-primary]" />
               </div>
               {!sidebarCollapsed && (
                 <div>
                   <h2 className="text-lg font-bold text-white">NutriThata</h2>
                   <p className="text-sm text-white/80">Plataforma de Nutrição</p>
                 </div>
               )}
             </div>
             <Button
               variant="ghost"
               size="icon"
               onClick={toggleSidebar}
               className="text-white hover:bg-white/10"
             >
               {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
             </Button>
           </div>
         </div>

         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-2">
           {!sidebarCollapsed && (
             <h3 className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wider mb-4">
               Navegação
             </h3>
           )}
           {navigationItems.map((item) => {
             const Icon = item.icon
             return (
               <Link
                 key={item.href}
                 to={item.href}
                 className={cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                   item.active
                     ? "bg-[--color-primary] text-white shadow-md"
                     : "text-[--color-text-primary] hover:bg-[--color-hover]",
                   sidebarCollapsed && "justify-center px-2",
                 )}
                 title={sidebarCollapsed ? item.label : undefined}
               >
                 <Icon className="w-5 h-5 flex-shrink-0" />
                 {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
               </Link>
             )
           })}
         </nav>

         {/* User Info */}
         <div className="p-4">
           <div
             className={cn(
               "flex items-center gap-3 p-3 rounded-lg bg-[--color-hover]",
               sidebarCollapsed && "justify-center",
             )}
           >
             <div className="w-10 h-10 bg-[--color-primary] rounded-full flex items-center justify-center text-white font-semibold">
               {user?.name?.charAt(0).toUpperCase() || "U"}
             </div>
             {!sidebarCollapsed && (
               <div className="flex-1 min-w-0">
                 <p className="font-medium text-[--color-text-primary] truncate">{user?.name || "Usuário"}</p>
                 <p className="text-sm text-[--color-text-secondary] capitalize">
                   {user?.role?.toLowerCase() || "usuário"}
                 </p>
               </div>
             )}
           </div>
           {!sidebarCollapsed && (
             <Button
               variant="outline"
               onClick={handleLogout}
               className="w-full mt-3 justify-start border-[--color-border] hover:bg-[--color-hover] bg-transparent text-[--color-text-primary]"
             >
               <LogOut className="w-4 h-4 mr-2" />
               Sair
             </Button>
           )}
         </div>
       </aside>

             {/* Main Content */}
       <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-72")}>
         {/* Header */}
         <header className="bg-[--color-surface] border-b border-[--color-border] shadow-sm sticky top-0 z-20 backdrop-blur-sm">
           <div className="flex items-center justify-end px-6 py-4">
             <div className="flex items-center gap-4">
               <NotificationDropdown />
             </div>
           </div>
         </header>

         {/* Content */}
         <main className="flex-1 p-6 overflow-y-auto bg-[--color-background]">
           <div className="max-w-screen mx-auto">{children}</div>
         </main>
       </div>
    </div>
  )
}
