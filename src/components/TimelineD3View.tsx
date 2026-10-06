import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CARRILES, DATOS_HITOS, TIPO_CONFIG, FAMILIAS_CROMATICAS, parseDateStrict } from '../data/timelineData';
import { CarrilId, HitoTimeline } from '../types/timeline';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface TimelineD3ViewProps {
  hitos: HitoTimeline[];
  selectedHitoId: string | null;
  onSelectHito: (hito: HitoTimeline) => void;
  filteredTipos: string[];
}

const LEFT_PANEL_WIDTH = 190;
const LANE_HEIGHT = 140;
const HEADER_HEIGHT = 50;
const CARD_WIDTH = 180;
const CARD_HEIGHT = 28;

export const TimelineD3View: React.FC<TimelineD3ViewProps> = ({
  hitos,
  selectedHitoId,
  onSelectHito,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [timelineWidth, setTimelineWidth] = useState<number>(900);
  const [currentZoomLabel, setCurrentZoomLabel] = useState<string>('27 meses');
  const [tooltipData, setTooltipData] = useState<{
    hito: HitoTimeline;
    x: number;
    y: number;
  } | null>(null);

  // Default domain: Mar 1, 2024 to Nov 30, 2026 (32 months - encompasses BM025 in March 2024)
  const defaultDomain = useMemo<[Date, Date]>(() => {
    return [new Date(2024, 2, 1), new Date(2026, 10, 30)];
  }, []);

  const [currentDomain, setCurrentDomain] = useState<[Date, Date]>(defaultDomain);

  // 1. Responsive ResizeObserver to ensure timeline always has exact container width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth - LEFT_PANEL_WIDTH;
        if (available > 200) {
          setTimelineWidth(available);
        }
      }
    };

    updateWidth();
    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Base D3 Time Scale
  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain(currentDomain)
      .range([10, timelineWidth - 20]);
  }, [currentDomain, timelineWidth]);

  // 3. Stagger stacking algorithm: ensures nearby events in the same lane get separate tracks
  const laneLayout = useMemo(() => {
    const layoutMap: {
      [hitoId: string]: {
        x: number;
        y: number;
        laneIndex: number;
        trackIndex: number;
        parsedDate: Date;
      };
    } = {};

    CARRILES.forEach((carril, laneIndex) => {
      const laneHitos = hitos
        .filter((h) => h.carrilId === carril.id)
        .sort((a, b) => parseDateStrict(a.fecha).getTime() - parseDateStrict(b.fecha).getTime());

      // Track end times in pixels
      const trackEnds: number[] = [-9999, -9999, -9999];

      laneHitos.forEach((h) => {
        const parsed = parseDateStrict(h.fecha);
        const xPos = xScale(parsed);

        // Find track with lowest overlap or earliest availability
        let assignedTrack = 0;
        let foundFree = false;

        for (let t = 0; t < trackEnds.length; t++) {
          if (xPos >= trackEnds[t] + 8) {
            assignedTrack = t;
            foundFree = true;
            break;
          }
        }

        if (!foundFree) {
          // If all tracks are active, pick the one that ends soonest
          let minEnd = trackEnds[0];
          let minIndex = 0;
          for (let t = 1; t < trackEnds.length; t++) {
            if (trackEnds[t] < minEnd) {
              minEnd = trackEnds[t];
              minIndex = t;
            }
          }
          assignedTrack = minIndex;
        }

        trackEnds[assignedTrack] = xPos + CARD_WIDTH;

        const yPos =
          HEADER_HEIGHT +
          laneIndex * LANE_HEIGHT +
          18 +
          assignedTrack * (CARD_HEIGHT + 10);

        layoutMap[h.id] = {
          x: xPos,
          y: yPos,
          laneIndex,
          trackIndex: assignedTrack,
          parsedDate: parsed,
        };
      });
    });

    return layoutMap;
  }, [hitos, xScale]);

  // 4. Generate Time Axis Ticks (Months and Years)
  const timeTicks = useMemo(() => {
    const [start, end] = currentDomain;
    const months = d3.timeMonth.range(start, end);
    const years = d3.timeYear.range(start, end);

    return {
      months: months.map((m) => ({
        date: m,
        x: xScale(m),
        label: d3.timeFormat('%b %y')(m),
      })),
      years: years.map((y) => ({
        date: y,
        x: xScale(y),
        label: d3.timeFormat('%Y')(y),
      })),
    };
  }, [currentDomain, xScale]);

  // 5. Interactive Zoom and Pan Controls
  const handleZoom = (factor: number) => {
    const [start, end] = currentDomain;
    const span = end.getTime() - start.getTime();
    const newSpan = span * factor;
    const center = (start.getTime() + end.getTime()) / 2;
    const newStart = new Date(center - newSpan / 2);
    const newEnd = new Date(center + newSpan / 2);

    // Bounds limit
    if (newStart < new Date(2024, 1, 1)) newStart.setTime(new Date(2024, 1, 1).getTime());
    if (newEnd > new Date(2026, 11, 31)) newEnd.setTime(new Date(2026, 11, 31).getTime());

    setCurrentDomain([newStart, newEnd]);
  };

  const handlePan = (direction: 'left' | 'right') => {
    const [start, end] = currentDomain;
    const shift = (end.getTime() - start.getTime()) * 0.25 * (direction === 'left' ? -1 : 1);
    setCurrentDomain([
      new Date(start.getTime() + shift),
      new Date(end.getTime() + shift),
    ]);
  };

  const handlePreset = (preset: '2024' | '2025' | '2026' | 'all') => {
    switch (preset) {
      case 'all':
        setCurrentDomain([new Date(2024, 2, 1), new Date(2026, 10, 30)]);
        setCurrentZoomLabel('32 meses');
        break;
      case '2024':
        setCurrentDomain([new Date(2024, 2, 1), new Date(2024, 11, 31)]);
        setCurrentZoomLabel('2024');
        break;
      case '2025':
        setCurrentDomain([new Date(2025, 0, 1), new Date(2025, 11, 31)]);
        setCurrentZoomLabel('2025');
        break;
      case '2026':
        setCurrentDomain([new Date(2026, 0, 1), new Date(2026, 10, 30)]);
        setCurrentZoomLabel('2026');
        break;
    }
  };

  // 6. SVG Drag Pan support
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartDomainRef = useRef<[Date, Date]>([new Date(), new Date()]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartDomainRef.current = [new Date(currentDomain[0]), new Date(currentDomain[1])];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) < 2) return;

    const [origStart, origEnd] = dragStartDomainRef.current;
    const timePerPixel = (origEnd.getTime() - origStart.getTime()) / timelineWidth;
    const timeShift = -dx * timePerPixel;

    setCurrentDomain([
      new Date(origStart.getTime() + timeShift),
      new Date(origEnd.getTime() + timeShift),
    ]);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const totalSvgHeight = HEADER_HEIGHT + CARRILES.length * LANE_HEIGHT + 10;

  return (
    <div
      ref={containerRef}
      data-tab="timeline"
      className="flex flex-col bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden select-none"
    >
      {/* Top Toolbar: Period Presets & Zoom Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-100/90 border-b border-stone-200 text-xs">
        {/* Presets */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            Periodos:
          </span>
          <div className="inline-flex rounded-lg bg-stone-200/80 p-0.5">
            <button
              onClick={() => handlePreset('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLabel === '32 meses'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              32 Meses (Completo)
            </button>
            <button
              onClick={() => handlePreset('2024')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLabel === '2024'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2024 (Inicios)
            </button>
            <button
              onClick={() => handlePreset('2025')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLabel === '2025'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2025 (Escalada)
            </button>
            <button
              onClick={() => handlePreset('2026')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                currentZoomLabel === '2026'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2026 (Desenlace)
            </button>
          </div>
        </div>

        {/* Zoom & Centering Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-stone-500 mr-1 hidden sm:inline">
            Zoom / Paneo:
          </span>
          <button
            onClick={() => handlePan('left')}
            title="Desplazar a la izquierda"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handlePan('right')}
            title="Desplazar a la derecha"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.7)}
            title="Acercar zoom"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.4)}
            title="Alejar zoom"
            className="p-1.5 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handlePreset('all')}
            title="Centrar todo el periodo 2024-2026"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors ml-1 font-medium text-[11px]"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden md:inline">Centrar todo</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Lane Timeline Canvas Area */}
      <div className="flex bg-stone-50/50 relative overflow-hidden">
        {/* Left Side: Swimlane Headers (Fixed 190px Width) */}
        <div
          style={{ width: `${LEFT_PANEL_WIDTH}px`, minWidth: `${LEFT_PANEL_WIDTH}px` }}
          className="bg-stone-100 border-r-2 border-stone-200 z-10 flex flex-col shrink-0"
        >
          {/* Top Left Header Spacer */}
          <div
            style={{ height: `${HEADER_HEIGHT}px` }}
            className="border-b border-stone-200 px-3 flex items-center justify-between bg-stone-200/60"
          >
            <span className="font-bold text-[11px] uppercase tracking-wider text-stone-600">
              Carriles
            </span>
            <span className="text-[10px] font-mono text-stone-500 bg-white/70 px-1.5 py-0.5 rounded">
              3 ejes
            </span>
          </div>

          {/* 3 Swimlane Labels */}
          {CARRILES.map((carril) => {
            const laneCount = hitos.filter((h) => h.carrilId === carril.id).length;
            return (
              <div
                key={carril.id}
                style={{ height: `${LANE_HEIGHT}px` }}
                className="border-b border-stone-200 p-3 flex flex-col justify-center bg-stone-100/90"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: carril.colorAccent }}
                  />
                  <div className="font-bold text-stone-900 text-xs leading-tight tracking-tight">
                    {carril.titulo}
                  </div>
                </div>
                <div className="text-[11px] text-stone-500 font-normal mt-1 flex items-center gap-1.5">
                  <span className="font-mono font-medium text-stone-700 bg-white border border-stone-200 px-1.5 py-0.2 rounded text-[10px]">
                    {laneCount} {laneCount === 1 ? 'hito' : 'hitos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: D3 SVG Responsive Timeline Canvas */}
        <div
          className="flex-1 overflow-x-hidden relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            width={timelineWidth}
            height={totalSvgHeight}
            className="w-full block"
          >
            {/* 1. Time Axis Header Background */}
            <rect
              x={0}
              y={0}
              width={timelineWidth}
              height={HEADER_HEIGHT}
              fill="#F5F5F4"
              stroke="#E7E5E4"
              strokeWidth={1}
            />

            {/* 2. Swimlane Horizontal Backgrounds */}
            {CARRILES.map((carril, i) => (
              <g key={`lane-bg-${carril.id}`}>
                <rect
                  x={0}
                  y={HEADER_HEIGHT + i * LANE_HEIGHT}
                  width={timelineWidth}
                  height={LANE_HEIGHT}
                  fill={i % 2 === 0 ? '#FAFAF9' : '#FFFFFF'}
                  stroke="#E7E5E4"
                  strokeWidth={1}
                />
              </g>
            ))}

            {/* 3. Year Dividing Vertical Lines & Header Marks */}
            {timeTicks.years.map((yearMark, idx) => (
              <g key={`year-${idx}`}>
                <line
                  x1={yearMark.x}
                  y1={HEADER_HEIGHT}
                  x2={yearMark.x}
                  y2={totalSvgHeight}
                  stroke="#D6D3D1"
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                />
                <text
                  x={yearMark.x + 8}
                  y={18}
                  fontSize={12}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  fill="#1C1917"
                >
                  {yearMark.label}
                </text>
              </g>
            ))}

            {/* 4. Month Ticks & Vertical Minor Grids */}
            {timeTicks.months.map((monthMark, idx) => (
              <g key={`month-${idx}`}>
                <line
                  x1={monthMark.x}
                  y1={HEADER_HEIGHT - 6}
                  x2={monthMark.x}
                  y2={totalSvgHeight}
                  stroke="#F0EFE9"
                  strokeWidth={1}
                />
                <text
                  x={monthMark.x}
                  y={HEADER_HEIGHT - 12}
                  fontSize={10}
                  fontFamily="'JetBrains Mono', monospace"
                  fill="#78716C"
                  textAnchor="middle"
                >
                  {monthMark.label}
                </text>
              </g>
            ))}

            {/* SVG Definitions for shadows and clips */}
            <defs>
              <filter id="svg-text-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* 5. Event Nodes (Cards + Date Pins) */}
            {hitos.map((hito) => {
              const layout = laneLayout[hito.id];
              if (!layout) return null;

              const cfg = TIPO_CONFIG[hito.tipo] || {
                color: '#4B5563',
                borderColor: '#374151',
                className: '',
              };

              const isSelected = hito.id === selectedHitoId;
              const cardX = Math.max(5, Math.min(timelineWidth - CARD_WIDTH - 10, layout.x - 10));
              const cardY = layout.y;

              return (
                <g
                  key={hito.id}
                  className={`transition-transform duration-100 ${cfg.className || ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHito(hito);
                  }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltipData({
                        hito,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltipData(null)}
                >
                  {/* Stem Pin connecting exact calendar x to card */}
                  <line
                    x1={layout.x}
                    y1={HEADER_HEIGHT + layout.laneIndex * LANE_HEIGHT + 6}
                    x2={cardX + 12}
                    y2={cardY + CARD_HEIGHT / 2}
                    stroke={cfg.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  />

                  {/* Calendar Day Point Marker */}
                  <circle
                    cx={layout.x}
                    cy={HEADER_HEIGHT + layout.laneIndex * LANE_HEIGHT + 6}
                    r={3.5}
                    fill={cfg.color}
                    stroke="#FFFFFF"
                    strokeWidth={1.2}
                  />

                  {/* Event Card Rectangle */}
                  <rect
                    x={cardX}
                    y={cardY}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    rx={5}
                    ry={5}
                    fill={cfg.color}
                    stroke={isSelected ? '#000000' : cfg.borderColor}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    filter={isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'}
                    className="hover:opacity-95"
                  />

                  {/* Clean Keyword Text Label (NO BM### ID) - White Text with Contrast Filter */}
                  <text
                    x={cardX + 8}
                    y={cardY + 18}
                    fill="#FFFFFF"
                    fontSize={11}
                    fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                    fontWeight="600"
                    filter="url(#svg-text-shadow)"
                    clipPath={`url(#clip-${hito.id})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {hito.etiquetaCorta}
                  </text>

                  {/* Clip path for crisp ellipsis */}
                  <clipPath id={`clip-${hito.id}`}>
                    <rect x={cardX + 4} y={cardY} width={CARD_WIDTH - 12} height={CARD_HEIGHT} />
                  </clipPath>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {tooltipData && (
            <div
              style={{
                left: `${tooltipData.x + 12}px`,
                top: `${tooltipData.y - 10}px`,
              }}
              className="absolute pointer-events-none z-50 bg-stone-900 text-white rounded-lg p-3 text-xs shadow-xl max-w-xs space-y-1 animate-in fade-in duration-100"
            >
              <div className="flex items-center justify-between gap-2 border-b border-stone-700 pb-1">
                <span className="font-mono font-bold text-amber-400 text-[10px]">
                  {tooltipData.hito.id}
                </span>
                <span className="text-stone-300 text-[10px]">
                  {parseDateStrict(tooltipData.hito.fecha).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="font-bold text-stone-100 leading-snug">
                {tooltipData.hito.etiquetaCorta}
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed line-clamp-3">
                {tooltipData.hito.descripcion}
              </p>
              <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                <strong className="text-stone-300">Actores:</strong> {tooltipData.hito.actores}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chromatic Family Legend Bar */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-bold text-stone-700 text-[11px] uppercase tracking-wider shrink-0">
            Leyenda de Familias Cromáticas:
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
            {/* Familia Cálida */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-900 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D97706' }} />
                Cálida (Carril 1):
              </span>
              <span className="text-stone-600">Movilización (#D97706), Propuesta (#B45309), Posición (#F59E0B)</span>
            </div>

            {/* Familia Fría */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-blue-900 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />
                Fría (Carril 2):
              </span>
              <span className="text-stone-600">Normativo (#2563EB), Decisión (#1D4ED8), Legislativa (#60A5FA)</span>
            </div>

            {/* Familia Roja */}
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

      {/* Timeline Footnote & Interactive Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white border-t border-stone-200 text-[11px] text-stone-500">
        <div className="flex items-center gap-3">
          <span>
            Mostrando <strong>{hitos.length}</strong> de <strong>{DATOS_HITOS.length}</strong> hitos distribuidos
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Arrastra con el ratón para desplazarte horizontalmente
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium text-stone-600">
          <span>Haz clic en cualquier hito para abrir el panel de detalle lateral</span>
        </div>
      </div>
    </div>
  );
};
