import React, { useMemo, useState } from 'react';
import { DATOS_HITOS, TIPO_CONFIG } from './data/timelineData';
import { CarrilId, HitoTimeline } from './types/timeline';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { FilterBar } from './components/FilterBar';
import { TimelineD3View } from './components/TimelineD3View';
import { ComparativeMatrixView } from './components/ComparativeMatrixView';
import { DetailDrawer } from './components/DetailDrawer';
import { MethodologyModal } from './components/MethodologyModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'timeline' | 'matrix'>('timeline');
  const [selectedHito, setSelectedHito] = useState<HitoTimeline | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipos, setSelectedTipos] = useState<string[]>(Object.keys(TIPO_CONFIG));
  const [selectedCarril, setSelectedCarril] = useState<CarrilId | 'todos'>('todos');

  // Filtered dataset
  const filteredHitos = useMemo(() => {
    return DATOS_HITOS.filter((hito) => {
      // 1. Filter by Carril
      if (selectedCarril !== 'todos' && hito.carrilId !== selectedCarril) {
        return false;
      }

      // 2. Filter by Tipo
      if (!selectedTipos.includes(hito.tipo)) {
        return false;
      }

      // 3. Search query
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matches =
          hito.id.toLowerCase().includes(query) ||
          hito.descripcion.toLowerCase().includes(query) ||
          hito.actores.toLowerCase().includes(query) ||
          hito.tema.toLowerCase().includes(query) ||
          hito.tipo.toLowerCase().includes(query) ||
          hito.fecha.toLowerCase().includes(query) ||
          hito.etiquetaCorta.toLowerCase().includes(query) ||
          hito.cambioNormativoRaw.toLowerCase().includes(query) ||
          hito.evidencia.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [searchTerm, selectedTipos, selectedCarril]);

  // Handlers for Tipos filters
  const handleToggleTipo = (tipo: string) => {
    setSelectedTipos((prev) => {
      if (prev.includes(tipo)) {
        return prev.filter((t) => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  const handleSelectAllTipos = () => {
    const all = Object.keys(TIPO_CONFIG);
    if (selectedTipos.length === all.length) {
      setSelectedTipos([]);
    } else {
      setSelectedTipos(all);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTipos(Object.keys(TIPO_CONFIG));
    setSelectedCarril('todos');
  };

  // Chronological navigation within filtered list
  const currentHitoIndex = useMemo(() => {
    if (!selectedHito) return -1;
    return filteredHitos.findIndex((h) => h.id === selectedHito.id);
  }, [selectedHito, filteredHitos]);

  const handleNavigatePrev = () => {
    if (currentHitoIndex > 0) {
      setSelectedHito(filteredHitos[currentHitoIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (currentHitoIndex >= 0 && currentHitoIndex < filteredHitos.length - 1) {
      setSelectedHito(filteredHitos[currentHitoIndex + 1]);
    }
  };

  const handleSelectRelatedHito = (targetHitoId: string) => {
    const found = DATOS_HITOS.find((h) => h.id === targetHitoId);
    if (found) {
      // Ensure the tipo and carril of the related item are enabled if needed
      if (!selectedTipos.includes(found.tipo)) {
        setSelectedTipos((prev) => [...prev, found.tipo]);
      }
      setSelectedHito(found);
    }
  };

  // Export dataset function
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(DATOS_HITOS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'cronograma_seguridad_peru_2024_2026.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* 3-Zone Contract Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onExportData={handleExportData}
      />

      {/* Hero and Methodological Presentation */}
      <HeroIntro onOpenMethodology={() => setIsMethodologyOpen(true)} />

      {/* Main Interactive Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Superior Filters: Tipos, Search, Carril Toggle */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTipos={selectedTipos}
          onToggleTipo={handleToggleTipo}
          onSelectAllTipos={handleSelectAllTipos}
          selectedCarril={selectedCarril}
          onSelectCarril={setSelectedCarril}
          onResetFilters={handleResetFilters}
          activeCount={filteredHitos.length}
          totalCount={DATOS_HITOS.length}
        />

        {/* View Switcher: Responsive D3 Timeline vs Comparative Matrix */}
        {currentView === 'timeline' ? (
          <TimelineD3View
            hitos={filteredHitos}
            selectedHitoId={selectedHito?.id || null}
            onSelectHito={(hito) => setSelectedHito(hito)}
            filteredTipos={selectedTipos}
          />
        ) : (
          <ComparativeMatrixView
            hitos={filteredHitos}
            selectedHitoId={selectedHito?.id || null}
            onSelectHito={(hito) => setSelectedHito(hito)}
          />
        )}
      </main>

      {/* Lateral Detail Drawer (Modal / Drawer with strict rules) */}
      <DetailDrawer
        hito={selectedHito}
        onClose={() => setSelectedHito(null)}
        onSelectRelatedHito={handleSelectRelatedHito}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={currentHitoIndex > 0}
        hasNext={currentHitoIndex >= 0 && currentHitoIndex < filteredHitos.length - 1}
      />

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="mt-12 bg-white border-t border-stone-200 py-6 px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-stone-700">
              Cronograma de Seguridad Ciudadana en el Perú (2024–2026)
            </p>
            <p className="mt-0.5">
              Consolidación documental para fines de investigación académica · Universidad Nacional Mayor de San Marcos (UNMSM).
            </p>
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="hover:text-stone-900 underline underline-offset-2 transition-colors"
            >
              Diccionario Metodológico
            </button>
            <span>·</span>
            <span>Versión 1.0 (Octubre 2026)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
