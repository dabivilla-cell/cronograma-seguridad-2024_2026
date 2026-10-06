import React from 'react';
import { CARRILES, TIPO_CONFIG, parseDateStrict } from '../data/timelineData';
import { HitoTimeline } from '../types/timeline';
import { Calendar, ChevronRight, BarChart3, AlertCircle, Quote } from 'lucide-react';

interface ComparativeMatrixViewProps {
  hitos: HitoTimeline[];
  onSelectHito: (hito: HitoTimeline) => void;
  selectedHitoId: string | null;
}

export const ComparativeMatrixView: React.FC<ComparativeMatrixViewProps> = ({
  hitos,
  onSelectHito,
  selectedHitoId,
}) => {
  // Group hitos by Year and Month
  const periods: { [key: string]: { año: number; mes: number; label: string; hitos: HitoTimeline[] } } = {};

  // Sort chronological with strict parser
  const sortedHitos = [...hitos].sort(
    (a, b) => parseDateStrict(a.fecha).getTime() - parseDateStrict(b.fecha).getTime()
  );

  sortedHitos.forEach((h) => {
    const key = `${h.año}-${String(h.mes).padStart(2, '0')}`;
    if (!periods[key]) {
      const monthName = parseDateStrict(h.fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      periods[key] = {
        año: h.año,
        mes: h.mes,
        label: monthName,
        hitos: [],
      };
    }
    periods[key].hitos.push(h);
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Matriz Cronológica Comparativa Multi-Carril
          </h3>
          <p className="text-xs text-stone-500">
            Visualización tabular sincronizada por periodos mensuales para análisis de coincidencias y sucesiones
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-stone-600 bg-stone-200/80 px-2.5 py-1 rounded-md">
          {Object.keys(periods).length} periodos con hitos
        </span>
      </div>

      {/* Grid Headers for the 3 Swimlanes */}
      <div className="hidden lg:grid grid-cols-12 bg-stone-100/90 border-b border-stone-200 text-xs font-bold text-stone-700">
        <div className="col-span-2 px-4 py-3 border-r border-stone-200">
          Periodo Cronológico
        </div>
        <div className="col-span-3 px-4 py-3 border-r border-stone-200 flex items-center gap-2 text-amber-950">
          <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: '#D97706' }} />
          <span>Movilizaciones y Sociedad Civil</span>
        </div>
        <div className="col-span-3 px-4 py-3 border-r border-stone-200 flex items-center gap-2 text-blue-950">
          <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: '#2563EB' }} />
          <span>Cambios Normativos y Decisión</span>
        </div>
        <div className="col-span-4 px-4 py-3 flex items-center gap-2 text-rose-950">
          <span className="w-2.5 h-2.5 rounded-full shadow-2xs" style={{ backgroundColor: '#E11D48' }} />
          <span>Opinión Pública y Cobertura Mediática</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-200">
        {Object.entries(periods)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([periodKey, period]) => {
            const movilizaciones = period.hitos.filter((h) => h.carrilId === 'carril_movilizacion');
            const normativos = period.hitos.filter((h) => h.carrilId === 'carril_normativo');
            const opinion = period.hitos.filter((h) => h.carrilId === 'carril_opinion');

          return (
            <div
              key={periodKey}
              className="grid grid-cols-1 lg:grid-cols-12 hover:bg-stone-50/50 transition-colors"
            >
              {/* Period Column */}
              <div className="lg:col-span-2 p-4 bg-stone-50/40 lg:border-r border-stone-200 flex lg:flex-col justify-between items-start">
                <div>
                  <div className="font-serif font-bold text-stone-900 text-sm capitalize">
                    {period.label}
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                    {periodKey}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                  {period.hitos.length} {period.hitos.length === 1 ? 'hito' : 'hitos'}
                </span>
              </div>

              {/* Lane 1: Movilizaciones */}
              <div className="lg:col-span-3 p-3 lg:border-r border-stone-200 space-y-2">
                <div className="lg:hidden text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Movilizaciones y Sociedad Civil:
                </div>
                {movilizaciones.length === 0 ? (
                  <div className="text-xs text-stone-400 italic py-2">—</div>
                ) : (
                  movilizaciones.map((h) => (
                    <ItemCard
                      key={h.id}
                      hito={h}
                      isSelected={h.id === selectedHitoId}
                      onSelect={() => onSelectHito(h)}
                    />
                  ))
                )}
              </div>

              {/* Lane 2: Normativos */}
              <div className="lg:col-span-3 p-3 lg:border-r border-stone-200 space-y-2">
                <div className="lg:hidden text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                  Cambios Normativos y Decisión Institucional:
                </div>
                {normativos.length === 0 ? (
                  <div className="text-xs text-stone-400 italic py-2">—</div>
                ) : (
                  normativos.map((h) => (
                    <ItemCard
                      key={h.id}
                      hito={h}
                      isSelected={h.id === selectedHitoId}
                      onSelect={() => onSelectHito(h)}
                    />
                  ))
                )}
              </div>

              {/* Lane 3: Opinión Pública */}
              <div className="lg:col-span-4 p-3 space-y-2">
                <div className="lg:hidden text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                  Opinión Pública y Cobertura Mediática:
                </div>
                {opinion.length === 0 ? (
                  <div className="text-xs text-stone-400 italic py-2">—</div>
                ) : (
                  opinion.map((h) => (
                    <ItemCard
                      key={h.id}
                      hito={h}
                      isSelected={h.id === selectedHitoId}
                      onSelect={() => onSelectHito(h)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ItemCardProps {
  hito: HitoTimeline;
  isSelected: boolean;
  onSelect: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ hito, isSelected, onSelect }) => {
  const cfg = TIPO_CONFIG[hito.tipo] || {
    color: '#4B5563',
    borderColor: '#374151',
    className: '',
  };

  const formattedDay = new Date(hito.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      onClick={onSelect}
      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-stone-900 bg-stone-50 border-stone-400 shadow-md'
          : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs hover:border-stone-300'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: cfg.color }}
          />
          <span className="font-mono text-[10px] font-bold text-stone-700 bg-stone-100 px-1 py-0.2 rounded">
            {hito.id}
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            {formattedDay}
          </span>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded border"
          style={{
            borderColor: `${cfg.borderColor}50`,
            color: cfg.color,
            backgroundColor: `${cfg.color}15`,
          }}
        >
          {hito.tipo}
        </span>
      </div>

      <div className="font-semibold text-stone-900 text-xs leading-snug line-clamp-2">
        {hito.descripcion}
      </div>

      {/* If it has opinion poll, show quote indicator */}
      {hito.observacionOpinion && hito.observacionOpinion.length > 0 && (
        <div className="mt-1.5 p-1.5 bg-rose-50/70 border border-rose-200 rounded text-[11px] text-rose-900 flex items-center justify-between">
          <span className="font-serif italic truncate">
            "{hito.observacionOpinion[0].preguntaExacta}"
          </span>
          <span className="font-mono font-bold shrink-0 ml-1">
            {hito.observacionOpinion[0].resultado}%
          </span>
        </div>
      )}

      {/* Relations count */}
      {hito.relacionesEstructuradas.length > 0 && (
        <div className="mt-1.5 text-[10px] text-stone-500 flex items-center gap-1">
          <span>{hito.relacionesEstructuradas.length} {hito.relacionesEstructuradas.length === 1 ? 'conexión' : 'conexiones'}</span>
          <span>·</span>
          <span className="text-stone-600 truncate">{hito.relacionesEstructuradas[0].tipo}</span>
        </div>
      )}
    </div>
  );
};
