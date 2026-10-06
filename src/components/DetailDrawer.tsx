import React, { useEffect } from 'react';
import { FUENTES_CATALOGO, TIPO_CONFIG, CARRILES, HITOS_DATA, parseDateStrict } from '../data/timelineData';
import { HitoTimeline, RelacionItem, TipoRelacion } from '../types/timeline';
import {
  X,
  Calendar,
  Users,
  FileText,
  Link2,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building,
  HelpCircle,
  BarChart3,
  Quote,
} from 'lucide-react';

interface DetailDrawerProps {
  hito: HitoTimeline | null;
  onClose: () => void;
  onSelectRelatedHito: (hitoId: string) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  hito,
  onClose,
  onSelectRelatedHito,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hito) return null;

  const tipoConfig = TIPO_CONFIG[hito.tipo] || {
    label: hito.tipo,
    color: '#4B5563',
    borderColor: '#374151',
    bgBadge: 'bg-stone-100',
    textBadge: 'text-stone-800',
    descripcion: '',
  };

  const carril = CARRILES.find((c) => c.id === hito.carrilId);

  const formattedDate = parseDateStrict(hito.fecha).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Find reciprocal or incoming relations from other hitos to this hito
  const incomingRelations: { sourceHito: HitoTimeline; rel: RelacionItem }[] = [];
  HITOS_DATA.forEach((other) => {
    if (other.id !== hito.id) {
      other.relacionesEstructuradas.forEach((rel) => {
        if (rel.hitoDestinoId === hito.id) {
          incomingRelations.push({ sourceHito: other, rel });
        }
      });
    }
  });

  return (
    <>
      {/* Backdrop for mobile & focus */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="fixed top-0 right-0 h-full w-full sm:w-[540px] md:w-[620px] bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header with Color Accent Bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: tipoConfig.color }}
        />

        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-900 text-white tracking-wider">
              {hito.id}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${tipoConfig.color}15`,
                color: tipoConfig.color,
                borderColor: `${tipoConfig.color}40`,
              }}
            >
              {tipoConfig.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Prev / Next navigation */}
            {onNavigatePrev && (
              <button
                onClick={onNavigatePrev}
                disabled={!hasPrev}
                title="Hito anterior cronológico"
                className="p-1.5 rounded-md hover:bg-stone-200/70 text-stone-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onNavigateNext && (
              <button
                onClick={onNavigateNext}
                disabled={!hasNext}
                title="Hito posterior cronológico"
                className="p-1.5 rounded-md hover:bg-stone-200/70 text-stone-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-4 bg-stone-300 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 transition-colors"
              title="Cerrar panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-stone-800">
          {/* Metadata Block: Date & Carril */}
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="capitalize">{formattedDate}</span>
              <span>·</span>
              <span className="font-mono text-stone-600">Año {hito.año} / Mes {hito.mes}</span>
            </div>

            <h2
              id="drawer-title"
              className="text-xl font-bold text-stone-900 leading-snug mt-1"
            >
              {hito.descripcion}
            </h2>

            {carril && (
              <div className="mt-3 flex items-center gap-2 text-xs text-stone-600 bg-stone-100/80 px-3 py-2 rounded-lg border border-stone-200">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: carril.colorAccent }}
                />
                <div>
                  <span className="font-semibold text-stone-900">Carril:</span> {carril.titulo}
                </div>
              </div>
            )}
          </div>

          {/* Section: Actores Involucrados */}
          <div className="space-y-1.5 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-600" />
              Actores Involucrados
            </h3>
            <p className="text-sm text-stone-900 font-medium leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
              {hito.actores}
            </p>
          </div>

          {/* Section: Tema Central */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              Tema Central
            </h3>
            <p className="text-sm text-stone-800 leading-relaxed">
              {hito.tema}
            </p>
          </div>

          {/* Section: Opinión Pública (Mandatory Exact Question - Regla 3) */}
          {(hito.observacionOpinion && hito.observacionOpinion.length > 0) || hito.opinionPublicaRaw !== 'NA' ? (
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  Opinión Pública (Diccionario Metodológico - Regla 3)
                </div>
                <span className="text-[10px] font-mono font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Texto Exacto Verificado
                </span>
              </div>

              {hito.observacionOpinion && hito.observacionOpinion.length > 0 ? (
                <div className="space-y-4">
                  {hito.observacionOpinion.map((op) => (
                    <div
                      key={op.id}
                      className="bg-white rounded-lg p-3.5 border border-rose-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs font-bold text-stone-900">
                          {op.institucion}
                          <span className="font-normal text-stone-500 ml-1.5">· {op.fecha}</span>
                        </div>
                        <div className="flex items-baseline gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md text-rose-700 shrink-0">
                          <span className="font-mono text-lg font-bold tabular-nums">
                            {op.resultado}
                          </span>
                          <span className="text-xs font-semibold">{op.unidad}</span>
                        </div>
                      </div>

                      {/* Literal Original Question Text */}
                      <div className="relative pl-6 pr-2 py-1">
                        <Quote className="w-4 h-4 text-rose-400 absolute left-0 top-1 rotate-180" />
                        <p className="text-sm font-serif italic text-stone-800 leading-snug">
                          "{op.preguntaExacta}"
                        </p>
                      </div>

                      {/* Technical indicator metadata */}
                      <div className="text-xs text-stone-600 border-t border-stone-100 pt-2 flex flex-col gap-1">
                        <div>
                          <strong className="text-stone-700">Indicador:</strong> {op.indicador}
                        </div>
                        <div>
                          <strong className="text-stone-700">Población objetivo:</strong> {op.poblacion}
                        </div>
                        {op.notasMetodologicas && (
                          <div className="text-[11px] text-stone-500 italic">
                            Nota: {op.notasMetodologicas}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-3 border border-rose-200 text-sm text-stone-800">
                  <p className="font-medium">{hito.opinionPublicaRaw}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Operational & Institutional Dynamic Details */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Registros Específicos por Dimensión
            </h3>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {hito.cambioNormativoRaw !== 'NA' && (
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <Building className="w-3.5 h-3.5 text-blue-700" />
                    Cambio Normativo / Legislación:
                  </div>
                  <div className="text-blue-950 font-medium leading-relaxed">
                    {hito.cambioNormativoRaw}
                  </div>
                </div>
              )}

              {hito.respuestaInstitucionalRaw !== 'NA' && (
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    Respuesta Institucional Ejecutiva:
                  </div>
                  <div className="text-blue-950 leading-relaxed">
                    {hito.respuestaInstitucionalRaw}
                  </div>
                </div>
              )}

              {hito.movilizacionRaw !== 'NA' && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    Movilización y Acción Colectiva:
                  </div>
                  <div className="text-amber-950 leading-relaxed">
                    {hito.movilizacionRaw}
                  </div>
                </div>
              )}

              {hito.coberturaMediaticaRaw !== 'NA' && (
                <div className="p-3 rounded-lg bg-stone-100 border border-stone-200">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    Cobertura Mediática y Encuadre:
                  </div>
                  <div className="text-stone-700 leading-relaxed">
                    {hito.coberturaMediaticaRaw}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Conexiones con otros hitos (Regla 2 - Methodological warnings for Coincidencia temporal) */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-stone-600" />
                Conexiones con Otros Hitos ({hito.relacionesEstructuradas.length + incomingRelations.length})
              </h3>
            </div>

            {hito.relacionesEstructuradas.length === 0 && incomingRelations.length === 0 ? (
              <p className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-lg border border-stone-200">
                Este hito no posee conexiones catalogadas explícitas en la base de datos maestra.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Outgoing relations */}
                {hito.relacionesEstructuradas.map((rel) => {
                  const targetHito = HITOS_DATA.find((h) => h.id === rel.hitoDestinoId);
                  const isCoincidencia = rel.tipo === 'Coincidencia temporal';
                  const isIncierta = rel.tipo === 'Incierta';

                  return (
                    <div
                      key={rel.idRelacion}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                        isCoincidencia || isIncierta
                          ? 'bg-amber-50/70 border-amber-300'
                          : rel.tipo === 'Documentada'
                          ? 'bg-slate-100 border-slate-300'
                          : rel.tipo === 'Declarada por un actor'
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-stone-100 border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-stone-700">
                          Relación {rel.idRelacion}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${
                            isCoincidencia || isIncierta
                              ? 'bg-amber-100 text-amber-900 border-amber-400'
                              : rel.tipo === 'Documentada'
                              ? 'bg-slate-200 text-slate-800 border-slate-300'
                              : rel.tipo === 'Declarada por un actor'
                              ? 'bg-blue-100 text-blue-900 border-blue-400'
                              : 'bg-stone-200 text-stone-800 border-stone-400'
                          }`}
                        >
                          {rel.tipo}
                        </span>
                      </div>

                      {/* Regla 2: Strict Methodological Warning for Coincidencia temporal or Incierta */}
                      {(isCoincidencia || isIncierta) && (
                        <div className="flex items-start gap-2 p-2 bg-amber-100/80 rounded border border-amber-300 text-amber-950 font-medium text-[11px] leading-snug">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <strong>Advertencia Metodológica (Regla 2):</strong> Esta relación clasificada como "{rel.tipo}" documenta una correlación temporal preliminar. Conforme al diccionario metodológico, <u>no debe representarse como causalidad directa ni influencia demostrada</u> sin evidencia documental concluyente.
                          </div>
                        </div>
                      )}

                      {targetHito && (
                        <div className="flex items-start justify-between gap-2 pt-1 border-t border-black/10">
                          <div>
                            <span className="text-stone-500 font-medium">Hito relacionado:</span>
                            <div className="font-semibold text-stone-900 mt-0.5">
                              {targetHito.id} · {targetHito.fecha} ({targetHito.tipo})
                            </div>
                            <p className="text-stone-700 line-clamp-2 mt-0.5">
                              {targetHito.descripcion}
                            </p>
                          </div>
                          <button
                            onClick={() => onSelectRelatedHito(targetHito.id)}
                            className="shrink-0 px-2 py-1 bg-white hover:bg-stone-50 border border-stone-300 rounded font-medium text-stone-800 text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                          >
                            <span>Ver hito</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {rel.evidencia && (
                        <div className="text-[11px] text-stone-600 bg-white/60 p-2 rounded">
                          <strong className="text-stone-800">Evidencia metodológica:</strong> {rel.evidencia}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Incoming relations */}
                {incomingRelations.map(({ sourceHito, rel }) => {
                  const isCoincidencia = rel.tipo === 'Coincidencia temporal';
                  return (
                    <div
                      key={`incoming-${rel.idRelacion}`}
                      className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-stone-500">
                          Vinculado desde: {sourceHito.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-stone-200 text-stone-800 font-medium">
                          {rel.tipo}
                        </span>
                      </div>

                      {isCoincidencia && (
                        <div className="flex items-start gap-1.5 p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>Proximidad temporal sin causalidad directa.</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-stone-900">
                            {sourceHito.id} ({sourceHito.fecha})
                          </div>
                          <p className="text-stone-700 line-clamp-1">{sourceHito.descripcion}</p>
                        </div>
                        <button
                          onClick={() => onSelectRelatedHito(sourceHito.id)}
                          className="shrink-0 px-2 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded font-medium text-stone-800 text-[11px] flex items-center gap-1"
                        >
                          <span>Ver</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Fuentes y Evidencia */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-600" />
              Fuentes Documentales Catalogadas ({hito.fuenteIds.length})
            </h3>

            <div className="space-y-2.5">
              {hito.fuenteIds.map((fId) => {
                const fuente = FUENTES_CATALOGO[fId];
                if (!fuente) {
                  return (
                    <div key={fId} className="p-2.5 rounded bg-stone-100 font-mono text-xs">
                      {fId}
                    </div>
                  );
                }

                return (
                  <div
                    key={fId}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 text-xs space-y-1 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-stone-700 bg-white border border-stone-300 px-1.5 py-0.5 rounded text-[10px]">
                        {fuente.id}
                      </span>
                      <span className="text-[11px] font-medium text-stone-600">
                        {fuente.tipoFuente} · {fuente.fecha}
                      </span>
                    </div>

                    <div className="font-semibold text-stone-900 leading-snug pt-0.5">
                      {fuente.titulo}
                    </div>

                    <div className="text-stone-600">
                      <strong className="text-stone-700">Autor / Institución:</strong> {fuente.autorInstitucion}
                    </div>

                    <div className="text-[11px] text-stone-500 border-t border-stone-200/60 pt-1 mt-1">
                      {fuente.referencia}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evidencia general */}
            {hito.evidencia && (
              <div className="bg-stone-100 p-3 rounded-lg text-xs text-stone-700 mt-2">
                <strong className="text-stone-900">Evidencia metodológica registrada:</strong> {hito.evidencia}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-stone-500 font-mono">
            Hito {hito.id} / {HITOS_DATA.length}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar panel
          </button>
        </div>
      </aside>
    </>
  );
};
