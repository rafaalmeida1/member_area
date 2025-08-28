import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="not-found-container">
      
      {/* Background Image */}
      <div className="not-found-background">
        <div className="background-image"></div>
      </div>
      
      {/* Content */}
      <div className="not-found-content">
        <div className="not-found-card">
          {/* Logo */}
          <div className="not-found-logo">
            <span className="logo-text">TM</span>
          </div>

          {/* Error Content */}
          <div className="error-content">
            <div className="error-icon">
              <span className="error-number">404</span>
            </div>
            
            <h1 className="error-title">Página não encontrada</h1>
            <p className="error-description">
              A página que você está procurando não existe ou foi movida.
            </p>
            
            <div className="error-actions">
              <button
                className="primary-button"
                onClick={() => navigate('/')}
              >
                <Home size={18} />
                Voltar ao Início
              </button>
              
              <button
                className="secondary-button"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
