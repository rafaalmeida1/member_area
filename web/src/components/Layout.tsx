import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';
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
  ArrowLeft
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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Fechar sidebar quando a URL mudar (navegação em mobile)
  React.useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateToModule = (moduleId: number) => {
    console.log('Navegar para módulo:', moduleId);
    navigate(`/module/${moduleId}`);
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
            {/* <div className="header-actions">
              <ThemeToggle />
            </div> */}
          </div>
        </header>
        <main className="layout-simple-content">
          {children}
        </main>
      </div>
    );
  }

  // Layout com sidebar
  return (
    <div className="layout-main">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Botão de fechar no mobile */}
        <button 
          className="sidebar-close-button"
          onClick={() => setSidebarOpen(false)}
          style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
        >
          <X className="close-icon" />
        </button>
        
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">TM</div>
            <div className="logo-text">
              <h2>{professionalName || 'Nutri Thata'}</h2>
              <p>Plataforma</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Navegação</h3>
            <ul className="nav-list">
              <li>
                <Link 
                  to="/"
                  className="nav-item"
                >
                  <Home className="nav-icon" />
                  <span>Início</span>
                </Link>
              </li>
              
              {user?.role === 'PROFESSIONAL' && (
                <>
                  <li>
                    <Link 
                      to="/modules"
                      className="nav-item"
                    >
                      <FileText className="nav-icon" />
                      <span>Módulos</span>
                    </Link>
                  </li>

                  <li>
                    <Link 
                      to="/invites"
                      className="nav-item"
                    >
                      <Mail className="nav-icon" />
                      <span>Convites</span>
                    </Link>
                  </li>

                  <li>
                    <Link 
                      to="/patients"
                      className="nav-item"
                    >
                      <Users className="nav-icon" />
                      <span>Pacientes</span>
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link 
                  to="/profile"
                  className="nav-item"
                >
                  <UserCog className="nav-icon" />
                  <span>Minha Conta</span>
                </Link>
              </li>
              
              {/* <li>
                <Link 
                  to="/settings"
                  className="nav-item"
                >
                  <Settings className="nav-icon" />
                  <span>Minha Conta</span>
                </Link>
              </li> */}
            </ul>
          </div>
        </nav>

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
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut className="logout-icon" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle"
            >
              <Menu className="toggle-icon" />
            </Button>
            <h1 className="header-title">
              {title || `Bem-vindo, ${user?.name}`}
            </h1>
          </div>
          <div className="header-right">
            <NotificationDropdown onNavigateToModule={handleNavigateToModule} />
            {/* <ThemeToggle /> */}
          </div>
        </header>

        <main className="main-content-area">
          {children}
        </main>
      </div>
    </div>
  );
} 