import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Separator } from '@/components/ui/separator';
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detectar se é mobile
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Se mudou de mobile para desktop, fechar sidebar
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    <div className="sidebar-content">
      {/* Branding */}
      <div className="sidebar-branding">
        <div className="brand-logo">TM</div>
        <div className="brand-text">
          <h2>{professionalName || 'Nutri Thata'}</h2>
          <p>Plataforma</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sidebar-quick-actions">
        {user?.role === 'PROFESSIONAL' && (
          <Link to="/modules" style={{ textDecoration: 'none' }}>
            <Button 
              className="quick-create-btn" 
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Módulo
            </Button>
          </Link>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-title">Navegação</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/"
                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Home className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {user?.role === 'PROFESSIONAL' && (
              <>
                <li>
                  <Link 
                    to="/modules"
                    className={`nav-item ${location.pathname === '/modules' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <FileText className="nav-icon" />
                    <span>Módulos</span>
                  </Link>
                </li>

                <li>
                  <Link 
                    to="/invites"
                    className={`nav-item ${location.pathname === '/invites' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Mail className="nav-icon" />
                    <span>Convites</span>
                  </Link>
                </li>

                <li>
                  <Link 
                    to="/patients"
                    className={`nav-item ${location.pathname === '/patients' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Users className="nav-icon" />
                    <span>Pacientes</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Secondary Navigation */}
        <div className="nav-section">
          <Separator className="my-4" />
          <h3 className="nav-title">Gerenciamento</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/profile"
                className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <UserCog className="nav-icon" />
                <span>Minha Conta</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <User className="user-icon" />
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );

  // Layout com sidebar
  return (
    <div className="layout-main">
      {/* Sidebar para Desktop */}
      {!isMobile && (
        <aside className="sidebar-desktop">
          <SidebarContent />
        </aside>
      )}

      {/* Sidebar para Mobile usando Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="sidebar-mobile">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="header-title">
              {title || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <NotificationDropdown />
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sidebar-toggle"
                  >
                    <Menu className="toggle-icon" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            )}
          </div>
        </header>

        <main className="main-content-area">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 