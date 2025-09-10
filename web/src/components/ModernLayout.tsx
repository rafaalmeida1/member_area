import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { 
  Home, 
  User, 
  LogOut, 
  FileText, 
  Mail, 
  Users, 
  ArrowLeft, 
  Menu,
  Link2,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModernLayoutProps {
  children: React.ReactNode
  title?: string
  showSidebar?: boolean
  showBackButton?: boolean
  onBack?: () => void
}

interface NavigationGroupProps {
  group: {
    type?: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    items?: Array<{
      href: string
      icon: React.ComponentType<{ className?: string }>
      label: string
      active: boolean
    }>
  }
  onItemClick: () => void
}

function NavigationGroup({ group, onItemClick }: NavigationGroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasActiveItem = group.items?.some(item => item.active) || false
  
  // Abrir automaticamente se algum item estiver ativo
  React.useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true)
    }
  }, [hasActiveItem])

  const Icon = group.icon

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
            hasActiveItem
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm"
              : "text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {group.label}
          {isOpen ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-6">
        {group.items?.map((item) => {
          const ItemIcon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
                item.active
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm"
                  : "text-muted-foreground"
              )}
              onClick={onItemClick}
            >
              <ItemIcon className="h-4 w-4" />
              {item.label}
              {item.active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ModernLayout({ 
  children, 
  title, 
  showSidebar = true, 
  showBackButton = false, 
  onBack 
}: ModernLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  // Layout sem sidebar (para páginas de login, registro, etc.)
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
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

  // Estrutura de navegação com submenus
  const navigationItems: Array<{
    href?: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    active?: boolean
    type?: string
    items?: Array<{
      href: string
      icon: React.ComponentType<{ className?: string }>
      label: string
      active: boolean
    }>
  }> = [
    {
      href: "/",
      icon: Home,
      label: "Dashboard",
      active: pathname === "/",
    },
    // Menu de Administração (apenas para profissionais)
    ...((user?.role === "PROFESSIONAL" || user?.role === "ADMIN")
      ? [
          {
            type: "group",
            label: "Administração",
            icon: Shield,
            items: [
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
              {
                href: "/analytics",
                icon: BarChart3,
                label: "Analytics",
                active: pathname === "/analytics",
              },
            ]
          }
        ]
      : []),
    // Menu de Configurações (para todos)
    {
      type: "group",
      label: "Configurações",
      icon: Settings,
      items: [
        {
          href: "/profile",
          icon: User,
          label: "Perfil",
          active: pathname === "/profile",
        },
        // Cache (apenas para profissionais/admin)
        ...((user?.role === "PROFESSIONAL" || user?.role === "ADMIN")
          ? [
              {
                href: "/cache-management",
                icon: Database,
                label: "Gerenciar Cache",
                active: pathname === "/cache-management",
              }
            ]
          : []),
      ]
    },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Clube da Nutri</span>
            <span className="text-xs text-muted-foreground">Nutrição</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="space-y-4">
          {navigationItems.map((item, index) => {
            // Item simples (sem submenu)
            if (!item.type || item.type !== "group") {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
                    item.active
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.active && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              )
            }

            // Grupo com submenu
            return (
              <NavigationGroup
                key={index}
                group={item}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "Usuário"}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {user?.role?.toLowerCase() === 'professional' ? 'Profissional' : 'Usuário'}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full mt-2 justify-start text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--color-card)] border-r border-[var(--color-border)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Page Title */}
              <div className="flex items-center gap-2">
                {showBackButton && onBack && (
                  <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-[var(--color-muted)]">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                {title && (
                  <h1 className="text-lg font-semibold text-[var(--color-text)]">{title}</h1>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button (Mobile) */}
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Avatar (Mobile) */}
              <Avatar className="h-8 w-8 lg:hidden">
                <AvatarFallback className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-3 max-w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
