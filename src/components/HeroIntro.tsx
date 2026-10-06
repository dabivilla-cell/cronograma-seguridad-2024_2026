import React from 'react';
import { METODOLOGIA_REGLAS } from '../data/timelineData';
import { ShieldAlert, BookOpen, Scale, HelpCircle, CheckCircle } from 'lucide-react';

interface HeroIntroProps {
  onOpenMethodology: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onOpenMethodology }) => {
  return (
    <section className="bg-stone-50 border-b border-stone-200 pt-8 pb-7 px-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Editorial Sub-header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-sans font-medium flex items-center gap-2">
            <span>Base de Datos Documental</span>
            <span>·</span>
            <span>Período: Marzo 2024 – Octubre 2026 (32 meses)</span>
            <span>·</span>
            <span className="text-blue-900 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-blue-700" /> Verificada
            </span>
          </div>

          <button
            onClick={onOpenMethodology}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline underline-offset-4 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Consultar Diccionario Metodológico
          </button>
        </div>

        {/* Lead Headline & Description */}
        <div className="max-w-4xl space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-tight">
            Cronograma Multi-Nivel de Seguridad Ciudadana en el Perú
          </h1>
          <p className="text-sm md:text-base text-stone-600 leading-relaxed font-sans max-w-3xl">
            Herramienta interactiva de exploración histórica para examinar la concurrencia entre movilizaciones sociales, reformas penales punitivas y encuestas de percepción ciudadana en 32 meses de crisis de extorsión.
          </p>
        </div>

        {/* Three Methodological Safeguard Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-white rounded-lg border border-stone-200/80 shadow-2xs flex items-start gap-2.5">
            <div className="flex items-center gap-0.5 mt-1 shrink-0">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97706' }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563EB' }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E11D48' }} />
            </div>
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">1. Familias Cromáticas Estrictas</strong>
              <span className="text-stone-500 leading-tight">
                Naranjas en Movilización, Azules en Normativa y Carmín en Opinión Pública.
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-amber-200/80 bg-amber-50/20 shadow-2xs flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-1 shrink-0" />
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">2. No Causalidad Automática</strong>
              <span className="text-stone-600 leading-tight">
                Las coincidencias temporales no se interpretan como causa directa ni causalidad.
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-rose-200/80 bg-rose-50/20 shadow-2xs flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 shrink-0" />
            <div className="text-xs">
              <strong className="text-stone-900 block font-semibold">3. Texto Exacto en Encuestas</strong>
              <span className="text-stone-600 leading-tight">
                Los datos de opinión pública exponen la formulación textual original de cada pregunta.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
