import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Separator } from '@/components/ui/separator';
import { useMobile } from '@/hooks/use-mobile';
import {
  Home,
  User,
  Settings,
  LogOut,
  FileText,
  Mail,
  UserCog,
  Menu,
  X,
  Users,
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Search,
  Bell
} from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  professionalName?: string;
}

export function Layout({
  children,
  title,
  showSidebar = true,
  showBackButton = false,
  onBack,
  professionalName
}: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Layout sem sidebar (para páginas de login, registro, etc.)
  if (!showSidebar) {
    return (
      <div className="layout-simple">
        <header className="layout-simple-header">
          <div className="header-content">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="back-button"
              >
                <ArrowLeft className="back-icon" />
              </Button>
            )}
            <h1 className="header-title">{title}</h1>
          </div>
        </header>
        <main className="layout-simple-content">
          {children}
        </main>
      </div>
    );
  }

  // Componente do Sidebar
  const SidebarContent = () => (
    <>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div className="brand-logo">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2>NutriThata</h2>
            <p className="sidebar-subtitle">Plataforma de Nutrição</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">Principal</h3>
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Home className="nav-item-icon" />
            <span className="nav-item-text">Início</span>
          </Link>
          
          {user?.role === 'PROFESSIONAL' && (
            <Link
              to="/modules"
              className={`nav-item ${location.pathname === '/modules' ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FileText className="nav-item-icon" />
              <span className="nav-item-text">Módulos</span>
            </Link>
          )}
          
          {user?.role === 'PROFESSIONAL' && (
            <Link
              to="/patients"
              className={`nav-item ${location.pathname === '/patients' ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Users className="nav-item-icon" />
              <span className="nav-item-text">Pacientes</span>
            </Link>
          )}
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">Gerenciamento</h3>
          {user?.role === 'PROFESSIONAL' && (
            <Link
              to="/invites"
              className={`nav-item ${location.pathname === '/invites' ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Mail className="nav-item-icon" />
              <span className="nav-item-text">Convites</span>
            </Link>
          )}
          
          {user?.role === 'PROFESSIONAL' && (
            <Link
              to="/admin"
              className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <UserCog className="nav-item-icon" />
              <span className="nav-item-text">Admin</span>
            </Link>
          )}
        </div>

        <div className="nav-section">
          <h3 className="nav-section-title">Conta</h3>
          <Link
            to="/my-account"
            className={`nav-item ${location.pathname === '/my-account' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <User className="nav-item-icon" />
            <span className="nav-item-text">Minha Conta</span>
          </Link>
          
          <Link
            to="/settings"
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Settings className="nav-item-icon" />
            <span className="nav-item-text">Configurações</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Usuário'}</p>
            <p className="user-role">{user?.role?.toLowerCase() || 'usuário'}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="layout">
      {/* Sidebar Desktop */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Overlay para mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            {isMobile && (
              <button
                className="mobile-menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="header-title">{title || 'NutriThata'}</h1>
          </div>

          <div className="header-actions">
            <NotificationDropdown />
            <ThemeToggle />
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
} 