import React, { useEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import { CARRILES, HITOS_DATA, TIPO_CONFIG, parseDateStrict } from '../data/timelineData';
import { HitoTimeline, TipoHito } from '../types/timeline';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Calendar, Eye, Filter } from 'lucide-react';

interface TimelineViewProps {
  hitos: HitoTimeline[];
  selectedHitoId: string | null;
  onSelectHito: (hito: HitoTimeline) => void;
  filteredTipos: string[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  hitos,
  selectedHitoId,
  onSelectHito,
  filteredTipos,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<any>(null);
  const itemsDataSetRef = useRef<any>(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<string>('26 meses');

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Prepare Groups (The 3 Swimlanes - Compact without secondary subtitles)
    const groupsData = CARRILES.map((carril) => ({
      id: carril.id,
      content: `
        <div class="timeline-lane-header flex items-center gap-1.5 py-1 pr-1">
          <span class="inline-block w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${carril.colorAccent}"></span>
          <span class="font-bold text-stone-900 text-xs leading-tight tracking-tight">${carril.titulo}</span>
        </div>
      `,
      order: carril.orden,
      className: `lane-${carril.id}`,
    }));

    const groups = new DataSet(groupsData);

    // 2. Prepare Items with rigorous Date objects
    const itemsData = hitos.map((hito) => {
      const cfg = TIPO_CONFIG[hito.tipo] || {
        color: '#4B5563',
        borderColor: '#374151',
        label: hito.tipo,
      };

      const isSelected = hito.id === selectedHitoId;
      const parsedDate = parseDateStrict(hito.fecha);
      const formattedDate = parsedDate.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: hito.id,
        group: hito.carrilId,
        start: parsedDate, // Valid JavaScript Date object!
        content: `
          <div class="px-1 py-0.5 truncate font-medium text-xs text-white max-w-[200px]" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${hito.etiquetaCorta}">
            ${hito.etiquetaCorta}
          </div>
        `,
        title: `<strong>${hito.id} · ${formattedDate}</strong><br/><em>${hito.tipo}</em><br/><strong>${hito.descripcion}</strong><br/><small>Actores: ${hito.actores}</small>`,
        className: `timeline-item-${hito.id} ${cfg.className || ''} ${isSelected ? 'vis-selected' : ''}`,
        style: `
          background-color: ${cfg.color} !important;
          border-color: ${cfg.borderColor} !important;
          color: #FFFFFF !important;
          border-width: 1.5px !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45) !important;
          box-shadow: ${isSelected ? '0 0 0 2.5px rgba(0,0,0,0.85), 0 4px 10px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'} !important;
        `,
      };
    });

    const items = new DataSet(itemsData);
    itemsDataSetRef.current = items;

    // 3. Configure Timeline Options strictly defined from March 2024 to Nov 2026
    const minDate = new Date(2024, 2, 1);    // 1 de Marzo 2024 (BM025)
    const maxDate = new Date(2026, 10, 30);  // 30 de Noviembre 2026

    const options: any = {
      orientation: {
        axis: 'top',
        item: 'top',
      },
      min: minDate,
      max: maxDate,
      start: minDate,
      end: maxDate,
      zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 3, // ~3 years
      stack: true,
      stackSubgroups: true,
      horizontalScroll: true,
      zoomKey: 'ctrlKey',
      selectable: true,
      multiselect: false,
      margin: {
        item: 10,
        axis: 5,
      },
      locale: 'es',
      locales: {
        es: {
          current: 'actual',
          time: 'hora',
          deleteSelected: 'Eliminar selección',
        },
      },
      format: {
        minorLabels: {
          millisecond: 'SSS',
          second: 's',
          minute: 'HH:mm',
          hour: 'HH:mm',
          weekday: 'ddd D',
          day: 'D',
          week: 'w',
          month: 'MMM',
          year: 'YYYY',
        },
        majorLabels: {
          millisecond: 'HH:mm:ss',
          second: 'D MMMM HH:mm',
          minute: 'ddd D MMMM',
          hour: 'ddd D MMMM',
          weekday: 'MMMM YYYY',
          day: 'MMMM YYYY',
          week: 'MMMM YYYY',
          month: 'YYYY',
          year: '',
        },
      },
      groupOrder: 'order',
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap',
      },
    };

    // 4. Initialize Timeline instance
    const timeline = new Timeline(containerRef.current, items, groups, options);
    timelineRef.current = timeline;

    // Explicitly set window to encompass 2024-09 to 2026-11 immediately
    timeline.setWindow(minDate, maxDate, { animation: false });

    // Handle container rendering lifecycle to ensure items distribute across the whole width
    const initTimer = setTimeout(() => {
      if (timelineRef.current) {
        timelineRef.current.setWindow(minDate, maxDate, { animation: false });
        timelineRef.current.redraw();
      }
    }, 60);

    // Handle Selection Event
    timeline.on('select', (properties: { items: string[] }) => {
      if (properties.items && properties.items.length > 0) {
        const selectedId = properties.items[0];
        const found = hitos.find((h) => h.id === selectedId);
        if (found) {
          onSelectHito(found);
        }
      }
    });

    return () => {
      clearTimeout(initTimer);
      timeline.destroy();
    };
  }, []);

  // Update items when filtered hitos change
  useEffect(() => {
    if (!timelineRef.current || !itemsDataSetRef.current) return;

    const itemsData = hitos.map((hito) => {
      const cfg = TIPO_CONFIG[hito.tipo] || {
        color: '#4B5563',
        borderColor: '#374151',
        label: hito.tipo,
      };

      const isSelected = hito.id === selectedHitoId;
      const parsedDate = parseDateStrict(hito.fecha);
      const formattedDate = parsedDate.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      return {
        id: hito.id,
        group: hito.carrilId,
        start: parsedDate, // Valid JavaScript Date object!
        content: `
          <div class="px-1 py-0.5 truncate font-medium text-xs text-white max-w-[200px]" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${hito.etiquetaCorta}">
            ${hito.etiquetaCorta}
          </div>
        `,
        title: `<strong>${hito.id} · ${formattedDate}</strong><br/><em>${hito.tipo}</em><br/><strong>${hito.descripcion}</strong><br/><small>Actores: ${hito.actores}</small>`,
        className: `timeline-item-${hito.id} ${cfg.className || ''} ${isSelected ? 'vis-selected' : ''}`,
        style: `
          background-color: ${cfg.color} !important;
          border-color: ${cfg.borderColor} !important;
          color: #FFFFFF !important;
          border-width: 1.5px !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45) !important;
          box-shadow: ${isSelected ? '0 0 0 2.5px rgba(0,0,0,0.85), 0 4px 10px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'} !important;
        `,
      };
    });

    itemsDataSetRef.current.clear();
    itemsDataSetRef.current.add(itemsData);

    if (selectedHitoId) {
      timelineRef.current.setSelection([selectedHitoId], { focus: false });
    }
  }, [hitos, selectedHitoId]);

  // Synchronize selection highlight
  useEffect(() => {
    if (!timelineRef.current) return;
    if (selectedHitoId) {
      timelineRef.current.setSelection([selectedHitoId], { focus: false });
    } else {
      timelineRef.current.setSelection([]);
    }
  }, [selectedHitoId]);

  // Timeline Controls Handlers
  const handleZoomIn = () => {
    if (!timelineRef.current) return;
    timelineRef.current.zoomIn(0.4);
  };

  const handleZoomOut = () => {
    if (!timelineRef.current) return;
    timelineRef.current.zoomOut(0.4);
  };

  const handleMoveLeft = () => {
    if (!timelineRef.current) return;
    const range = timelineRef.current.getWindow();
    const interval = range.end - range.start;
    timelineRef.current.setWindow({
      start: range.start.valueOf() - interval * 0.25,
      end: range.end.valueOf() - interval * 0.25,
      animation: { duration: 300, easingFunction: 'easeInOutQuad' },
    });
  };

  const handleMoveRight = () => {
    if (!timelineRef.current) return;
    const range = timelineRef.current.getWindow();
    const interval = range.end - range.start;
    timelineRef.current.setWindow({
      start: range.start.valueOf() + interval * 0.25,
      end: range.end.valueOf() + interval * 0.25,
      animation: { duration: 300, easingFunction: 'easeInOutQuad' },
    });
  };

  const handleFitAll = () => {
    if (!timelineRef.current) return;
    timelineRef.current.setWindow(new Date(2024, 2, 1), new Date(2026, 10, 30), {
      animation: { duration: 400, easingFunction: 'easeInOutQuad' },
    });
    setCurrentZoomLevel('32 meses');
  };

  const handleJumpToPreset = (preset: '2024' | '2025' | '2026' | 'all') => {
    if (!timelineRef.current) return;
    switch (preset) {
      case '2024':
        timelineRef.current.setWindow({
          start: new Date(2024, 2, 1),
          end: new Date(2024, 11, 31),
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
        setCurrentZoomLevel('2024');
        break;
      case '2025':
        timelineRef.current.setWindow({
          start: new Date(2025, 0, 1),
          end: new Date(2025, 11, 31),
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
        setCurrentZoomLevel('2025');
        break;
      case '2026':
        timelineRef.current.setWindow({
          start: new Date(2026, 0, 1),
          end: new Date(2026, 10, 30),
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
        setCurrentZoomLevel('2026');
        break;
      case 'all':
        handleFitAll();
        break;
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Control Utility Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-100/80 border-b border-stone-200 text-xs">
        {/* Navigation & Presets */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            Periodos:
          </span>
          <div className="inline-flex rounded-lg bg-stone-200/80 p-0.5">
            <button
              onClick={() => handleJumpToPreset('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLevel === '32 meses'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              32 Meses (Completo)
            </button>
            <button
              onClick={() => handleJumpToPreset('2024')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLevel === '2024'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2024 (Inicios)
            </button>
            <button
              onClick={() => handleJumpToPreset('2025')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLevel === '2025'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2025 (Escalada)
            </button>
            <button
              onClick={() => handleJumpToPreset('2026')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLevel === '2026'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2026 (Desenlace)
            </button>
          </div>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-stone-500 mr-2 hidden sm:inline">
            Zoom / Navegación:
          </span>
          <button
            onClick={handleMoveLeft}
            title="Desplazar a la izquierda"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMoveRight}
            title="Desplazar a la derecha"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            title="Acercar zoom"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Alejar zoom"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitAll}
            title="Ajustar escala a todos los hitos"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors ml-1 font-medium text-[11px]"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden md:inline">Centrar todo</span>
          </button>
        </div>
      </div>

      {/* Vis.js Timeline Canvas Container */}
      <div className="p-3 bg-stone-50">
        <div
          ref={containerRef}
          className="w-full min-h-[440px] md:min-h-[480px] rounded-lg shadow-inner"
        />
      </div>

      {/* Chromatic Family Legend Bar */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-bold text-stone-700 text-[11px] uppercase tracking-wider shrink-0">
            Leyenda de Familias Cromáticas:
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-900 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D97706' }} />
                Cálida (Carril 1):
              </span>
              <span className="text-stone-600">Movilización (#D97706), Propuesta (#B45309), Posición (#F59E0B)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-blue-900 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />
                Fría (Carril 2):
              </span>
              <span className="text-stone-600">Normativo (#2563EB), Decisión (#1D4ED8), Legislativa (#60A5FA)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-rose-900 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E11D48' }} />
                Roja (Carril 3):
              </span>
              <span className="text-stone-600">Opinión (#DC2626), Acontecimiento (#E11D48), Medios (#F87171), Académica (#9F1239)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Footnote & Quick Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white border-t border-stone-200 text-[11px] text-stone-500">
        <div className="flex items-center gap-3">
          <span>
            Mostrando <strong>{hitos.length}</strong> de <strong>{HITOS_DATA.length}</strong> hitos registrados
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Usa <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono text-[10px]">Ctrl</kbd> + rueda del ratón o arrastra para desplazarte
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium text-stone-600">
          <span>Haz clic en cualquier hito para abrir el panel de detalle lateral</span>
        </div>
      </div>
    </div>
  );
};
