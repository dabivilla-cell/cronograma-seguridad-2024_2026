import React from 'react';
import { METODOLOGIA_REGLAS } from '../data/timelineData';
import { X, BookOpen, AlertTriangle, CheckCircle2, Shield, HelpCircle, FileSpreadsheet } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-200 text-stone-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Diccionario Metodológico Oficial (2024-2026)
              </h2>
              <p className="text-xs text-stone-500">
                Normas de trazabilidad, no causalidad y categorización de seguridad ciudadana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-stone-700">
          {/* Three Mandatory System Rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-600" />
              Tres Reglas Metodológicas Fundamentales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {METODOLOGIA_REGLAS.reglasObligatorias.map((regla) => (
                <div
                  key={regla.numero}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-700">
                      Regla {regla.numero}
                    </div>
                    <div className="font-semibold text-stone-900 text-xs mt-1 leading-snug">
                      {regla.titulo}
                    </div>
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                      {regla.descripcion}
                    </p>
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 border-t border-stone-200 pt-2 mt-2">
                    {regla.alerta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classification of Relations */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Criterios de Clasificación de Relaciones entre Hitos (Hoja 5)
            </h3>
            <p className="text-xs text-stone-600">
              La base tiene carácter estrictamente <strong>descriptivo y exploratorio</strong>. No establece causalidad automática ni evalúa la eficacia aislada de políticas públicas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {METODOLOGIA_REGLAS.clasificacionRelaciones.map((rel) => (
                <div
                  key={rel.tipo}
                  className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-900">{rel.tipo}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${rel.color}`}>
                      Categoría
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rel.criterio}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Database Structure */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-stone-600" />
              Estructura de Insumos y Verificación
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-3 bg-stone-100 rounded-lg text-center">
                <div className="font-mono text-xl font-bold text-stone-900">{METODOLOGIA_REGLAS.totalHitos}</div>
                <div className="text-stone-600 text-[11px] mt-0.5">Hitos Maestros</div>
              </div>
              <div className="p-3 bg-stone-100 rounded-lg text-center">
                <div className="font-mono text-xl font-bold text-stone-900">32</div>
                <div className="text-stone-600 text-[11px] mt-0.5">Meses Analizados</div>
              </div>
              <div className="p-3 bg-stone-100 rounded-lg text-center">
                <div className="font-mono text-xl font-bold text-stone-900">{METODOLOGIA_REGLAS.totalFuentes}</div>
                <div className="text-stone-600 text-[11px] mt-0.5">Fuentes Catalogadas</div>
              </div>
              <div className="p-3 bg-stone-100 rounded-lg text-center">
                <div className="font-mono text-xl font-bold text-stone-900">{METODOLOGIA_REGLAS.totalRelaciones}</div>
                <div className="text-stone-600 text-[11px] mt-0.5">Relaciones Evaluadas</div>
              </div>
              <div className="p-3 bg-stone-100 rounded-lg text-center">
                <div className="font-mono text-xl font-bold text-stone-900">{METODOLOGIA_REGLAS.totalActores}</div>
                <div className="text-stone-600 text-[11px] mt-0.5">Actores Mapeados</div>
              </div>
            </div>
          </div>

          {/* Cataloged Methodological Relations Highlight (R020 – R022) */}
          <div className="space-y-2 pt-3 border-t border-stone-200 text-xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Relaciones Metodológicas Recientes (R020 – R022)
            </h3>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                  <span>R020: BM027 (Latinobarómetro 2024) → BM019 (Latinobarómetro 2026)</span>
                  <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">Documentada</span>
                </div>
                <p className="text-stone-700 text-[11px] mt-1">
                  Mismo indicador medido por Latinobarómetro en dos oleadas: incremento de la percepción de pérdida de batalla contra el crimen organizado de 61% (2024) a 67% (2026). Fuentes: F049, F033.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-300">
                <div className="flex items-center justify-between font-mono font-bold text-amber-950">
                  <span>R021: BM025 (Datum Desconfianza) → BM001 (1° Paro Transportistas)</span>
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] border border-amber-300">Incierta (Regla 2)</span>
                </div>
                <p className="text-stone-700 text-[11px] mt-1">
                  Alta desconfianza en el sistema judicial (85%) precede a las movilizaciones gremiales, sin declaración explícita de causalidad directa. Fuentes: F047, F001.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-300">
                <div className="flex items-center justify-between font-mono font-bold text-amber-950">
                  <span>R022: BM029 (Ipsos 66% Inseguridad) → BM008 (Estado de Emergencia)</span>
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] border border-amber-300">Coincidencia temporal (Regla 2)</span>
                </div>
                <p className="text-stone-700 text-[11px] mt-1">
                  Consolidación de la inseguridad ciudadana como máxima preocupación (66%) coincide temporalmente con la declaratoria de Estado de Emergencia en Lima y Callao. Fuentes: F051, F013.
                </p>
              </div>
            </div>
          </div>

          {/* New Actors Highlight (A019 - A020) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-stone-100 rounded-lg space-y-1">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>Actor A019: Datum Internacional</span>
                <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">Encuestadora</span>
              </div>
              <p className="text-stone-700 text-[11px]">
                Registró 85% de desconfianza en el Poder Judicial y 73% en el Ministerio Público (2024-03-14). Fuentes: F047, F036.
              </p>
            </div>

            <div className="p-3 bg-stone-100 rounded-lg space-y-1">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>Actor A020: CPI</span>
                <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">Encuestadora</span>
              </div>
              <p className="text-stone-700 text-[11px]">
                Identificó a la inseguridad ciudadana como la primera prioridad de atención gubernamental con 53.5% (2024-12-19). Fuente: F048.
              </p>
            </div>
          </div>

          {/* Limits and Resolution Criteria */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              Criterios de Resolución de Discrepancias
            </div>
            <ul className="list-disc pl-4 space-y-1 text-amber-900 leading-relaxed">
              <li><strong>Fechas:</strong> Se prioriza la fecha de publicación en El Peruano sobre anuncios mediáticos.</li>
              <li><strong>Normas:</strong> Se conserva la numeración oficial (ej. Ley 32446, D.L. 1735) y su texto exacto.</li>
              <li><strong>Opinión Pública:</strong> Se reproduce el texto literal de la pregunta y el porcentaje exacto de la ficha técnica.</li>
              <li><strong>Relaciones:</strong> Se preserva la clasificación conservadora ("Coincidencia temporal" o "Incierta") ante la ausencia de prueba directa.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
