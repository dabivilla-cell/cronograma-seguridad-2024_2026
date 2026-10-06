import React from 'react';
import { TIPO_CONFIG, CARRILES, HITOS_DATA, FAMILIAS_CROMATICAS } from '../data/timelineData';
import { CarrilId } from '../types/timeline';
import { Search, RotateCcw, Filter, Check } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTipos: string[];
  onToggleTipo: (tipo: string) => void;
  onSelectAllTipos: () => void;
  selectedCarril: CarrilId | 'todos';
  onSelectCarril: (carril: CarrilId | 'todos') => void;
  onResetFilters: () => void;
  activeCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedTipos,
  onToggleTipo,
  onSelectAllTipos,
  selectedCarril,
  onSelectCarril,
  onResetFilters,
  activeCount,
  totalCount,
}) => {
  // Count items per tipo
  const tipoCounts: Record<string, number> = {};
  HITOS_DATA.forEach((h) => {
    tipoCounts[h.tipo] = (tipoCounts[h.tipo] || 0) + 1;
  });

  const allTipos = Object.keys(TIPO_CONFIG).filter(
    (t) => t !== 'Cobertura mediática / académica' // deduplicate alias for UI list
  );

  const isFiltered =
    searchTerm.trim() !== '' ||
    selectedCarril !== 'todos' ||
    selectedTipos.length < allTipos.length;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-4">
      {/* Top row: Search and Carril Segmented Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descripción, actor, ley, código (ej. BM006, extorsión, paro)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50 placeholder:text-stone-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Carriles Quick Switch */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0">
            <button
              onClick={() => onSelectCarril('todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                selectedCarril === 'todos'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos los Carriles (3)
            </button>
            {CARRILES.map((carril) => {
              const count = HITOS_DATA.filter((h) => h.carrilId === carril.id).length;
              const isSelected = selectedCarril === carril.id;
              return (
                <button
                  key={carril.id}
                  onClick={() => onSelectCarril(carril.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: carril.colorAccent }}
                  />
                  <span>{carril.titulo.split(' ')[0]}</span>
                  <span className="text-[11px] text-stone-400 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              title="Restablecer todos los filtros"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom section: Tipos de Evento agrupados por Carril */}
      <div className="space-y-3 border-t border-stone-100 pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              FILTRAR POR CARRIL Y TIPO DE EVENTO:
            </span>
            <span className="text-stone-500 text-[11px]">
              (<strong>{activeCount}</strong> de {totalCount} visibles)
            </span>
          </div>
          <button
            onClick={onSelectAllTipos}
            className="text-[11px] font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
          >
            {selectedTipos.length >= allTipos.length
              ? 'Deseleccionar todos'
              : 'Seleccionar todos'}
          </button>
        </div>

        {/* 3 Carril Filter Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {FAMILIAS_CROMATICAS.map((familia) => {
            return (
              <div
                key={familia.id}
                className="p-2.5 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-2"
              >
                {/* Carril Header */}
                <div className="flex items-center justify-between gap-1 pb-1 border-b border-stone-200/60">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: familia.colorBase }}
                    />
                    <span className="font-bold text-[11px] text-stone-800 uppercase tracking-wider">
                      {familia.nombre}
                    </span>
                  </div>
                </div>

                {/* Family Buttons */}
                <div className="flex flex-col gap-1.5">
                  {familia.tipos.map((tipoKey) => {
                    const cfg = TIPO_CONFIG[tipoKey];
                    if (!cfg) return null;
                    const isSelected = selectedTipos.includes(tipoKey);
                    const count = tipoCounts[tipoKey] || 0;

                    return (
                      <button
                        key={tipoKey}
                        onClick={() => onToggleTipo(tipoKey)}
                        className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs font-medium border transition-all text-left ${
                          isSelected
                            ? 'bg-white shadow-xs text-stone-900'
                            : 'bg-white/60 opacity-40 hover:opacity-75 text-stone-500 border-stone-200'
                        }`}
                        style={{
                          borderColor: isSelected ? cfg.borderColor : '#E7E5E4',
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Chromatic Swatch */}
                          <span
                            className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border border-black/10 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: cfg.color }}
                          >
                            {isSelected && (
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            )}
                          </span>

                          <span className="truncate text-[11px] font-semibold text-stone-800">
                            {cfg.label}
                          </span>
                        </div>

                        <span
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0"
                          style={{
                            backgroundColor: isSelected ? `${cfg.color}18` : '#F5F5F4',
                            color: isSelected ? cfg.color : '#78716C',
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
