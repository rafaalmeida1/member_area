import React from 'react';
import { Loader2, Palette, Sparkles, Star, Zap, Heart } from 'lucide-react';
import './ThemeLoadingScreen.css';

interface ThemeLoadingScreenProps {
  isLoading: boolean;
}

export function ThemeLoadingScreen({ isLoading }: ThemeLoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="theme-loading-overlay">
      {/* Partículas de fundo */}
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`bg-particle bg-particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="theme-loading-container">
        {/* Círculo de fundo animado */}
        <div className="loading-circle">
          <div className="circle-ring ring-1"></div>
          <div className="circle-ring ring-2"></div>
          <div className="circle-ring ring-3"></div>
          <div className="circle-ring ring-4"></div>
        </div>

        {/* Ícone central com efeitos */}
        <div className="loading-icon">
          <div className="icon-glow"></div>
          <Palette className="palette-icon" />
          <Sparkles className="sparkles-icon sparkle-1" />
          <Sparkles className="sparkles-icon sparkle-2" />
          <Sparkles className="sparkles-icon sparkle-3" />
        </div>

        {/* Texto animado melhorado */}
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
          <div className="loading-subtitle">
            <span className="subtitle-char">P</span>
            <span className="subtitle-char">r</span>
            <span className="subtitle-char">e</span>
            <span className="subtitle-char">p</span>
            <span className="subtitle-char">a</span>
            <span className="subtitle-char">r</span>
            <span className="subtitle-char">e</span>
            <span className="subtitle-char">&nbsp;</span>
            <span className="subtitle-char">s</span>
            <span className="subtitle-char">e</span>
            <span className="subtitle-char">u</span>
            <span className="subtitle-char">&nbsp;</span>
            <span className="subtitle-char">e</span>
            <span className="subtitle-char">x</span>
            <span className="subtitle-char">p</span>
            <span className="subtitle-char">e</span>
            <span className="subtitle-char">r</span>
            <span className="subtitle-char">i</span>
            <span className="subtitle-char">ê</span>
            <span className="subtitle-char">n</span>
            <span className="subtitle-char">c</span>
            <span className="subtitle-char">i</span>
            <span className="subtitle-char">a</span>
            <span className="subtitle-char">!</span>
          </div>
        </div>

        {/* Partículas flutuantes melhoradas */}
        <div className="floating-particles">
          <div className="particle particle-1">
            <Star className="particle-icon" />
          </div>
          <div className="particle particle-2">
            <Zap className="particle-icon" />
          </div>
          <div className="particle particle-3">
            <Heart className="particle-icon" />
          </div>
          <div className="particle particle-4">
            <Sparkles className="particle-icon" />
          </div>
          <div className="particle particle-5">
            <Star className="particle-icon" />
          </div>
          <div className="particle particle-6">
            <Zap className="particle-icon" />
          </div>
          <div className="particle particle-7">
            <Heart className="particle-icon" />
          </div>
          <div className="particle particle-8">
            <Sparkles className="particle-icon" />
          </div>
        </div>

        {/* Barra de progresso melhorada */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
            <div className="progress-glow"></div>
          </div>
          <div className="progress-text">
            <span className="progress-percentage">0%</span>
            <span className="progress-label">Carregando...</span>
          </div>
        </div>

        {/* Efeitos de brilho */}
        <div className="glow-effects">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
          <div className="glow-3"></div>
        </div>
      </div>
    </div>
  );
} 