import React from 'react';
import { Loader2, Palette, Sparkles } from 'lucide-react';
import './ThemeLoadingScreen.css';

interface ThemeLoadingScreenProps {
  isLoading: boolean;
}

export function ThemeLoadingScreen({ isLoading }: ThemeLoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="theme-loading-overlay">
      <div className="theme-loading-container">
        {/* Círculo de fundo animado */}
        <div className="loading-circle">
          <div className="circle-ring"></div>
          <div className="circle-ring"></div>
          <div className="circle-ring"></div>
        </div>

        {/* Ícone central */}
        <div className="loading-icon">
          <Palette className="palette-icon" />
          <Sparkles className="sparkles-icon" />
        </div>

        {/* Texto animado */}
        <div className="loading-text">
          <h2 className="loading-title">
            <span className="char">E</span>
            <span className="char">s</span>
            <span className="char">t</span>
            <span className="char">a</span>
            <span className="char">m</span>
            <span className="char">o</span>
            <span className="char">s</span>
            <span className="char">&nbsp;</span>
            <span className="char">c</span>
            <span className="char">a</span>
            <span className="char">r</span>
            <span className="char">r</span>
            <span className="char">e</span>
            <span className="char">g</span>
            <span className="char">a</span>
            <span className="char">n</span>
            <span className="char">d</span>
            <span className="char">o</span>
            <span className="char">&nbsp;</span>
            <span className="char">a</span>
            <span className="char">s</span>
            <span className="char">&nbsp;</span>
            <span className="char">c</span>
            <span className="char">o</span>
            <span className="char">r</span>
            <span className="char">e</span>
            <span className="char">s</span>
            <span className="char">&nbsp;</span>
            <span className="char">d</span>
            <span className="char">o</span>
            <span className="char">&nbsp;</span>
            <span className="char">t</span>
            <span className="char">e</span>
            <span className="char">m</span>
            <span className="char">a</span>
            <span className="char">.</span>
            <span className="char">.</span>
            <span className="char">.</span>
          </h2>
        </div>

        {/* Partículas flutuantes */}
        <div className="floating-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
        </div>

        {/* Barra de progresso */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 