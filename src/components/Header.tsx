import React from 'react';
import { BookOpen, Download, HelpCircle, Layers } from 'lucide-react';

interface HeaderProps {
  currentView: 'timeline' | 'matrix';
  onViewChange: (view: 'timeline' | 'matrix') => void;
  onOpenMethodology: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenMethodology,
  onExportData,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          className="font-serif text-lg md:text-xl font-bold tracking-tight text-stone-900 hover:text-stone-700 transition-colors"
        >
          Cronograma de Seguridad Ciudadana
        </a>
      </div>

      {/* Zone 2: Clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
        <button
          data-tab="timeline"
          onClick={() => onViewChange('timeline')}
          className={`hover:text-stone-900 transition-colors pb-0.5 ${
            currentView === 'timeline'
              ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
              : ''
          }`}
        >
          Línea de Tiempo
        </button>
        <button
          onClick={() => onViewChange('matrix')}
          className={`hover:text-stone-900 transition-colors pb-0.5 ${
            currentView === 'matrix'
              ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
              : ''
          }`}
        >
          Matriz Cronológica
        </button>
        <button
          onClick={onOpenMethodology}
          className="hover:text-stone-900 transition-colors"
        >
          Reglas Metodológicas
        </button>
      </nav>

      {/* Zone 3: Primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMethodology}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Diccionario</span>
        </button>
        <button
          onClick={onExportData}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Datos</span>
        </button>
      </div>
    </header>
  );
};
