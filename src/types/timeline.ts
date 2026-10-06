export type CarrilId = 'carril_movilizacion' | 'carril_normativo' | 'carril_opinion';

export interface Carril {
  id: CarrilId;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  colorAccent: string;
  orden: number;
}

export type TipoHito =
  | 'Movilización'
  | 'Acontecimiento público'
  | 'Cobertura mediática'
  | 'Cobertura mediática / posición académica'
  | 'Propuesta / posición de actor'
  | 'Posición de actor'
  | 'Cambio normativo'
  | 'Decisión institucional'
  | 'Propuesta legislativa'
  | 'Cambio en opinión pública';

export type TipoRelacion =
  | 'Documentada'
  | 'Declarada por un actor'
  | 'Coincidencia temporal'
  | 'Incierta';

export interface RelacionItem {
  idRelacion: string;
  hitoDestinoId: string;
  tipo: TipoRelacion;
  evidencia: string;
  fuenteIds: string[];
  descripcionRelacion?: string;
}

export interface ObservacionOpinionPublica {
  id: string;
  hitoId: string;
  fecha: string;
  institucion: string;
  preguntaExacta: string;
  indicador: string;
  resultado: number;
  unidad: string;
  poblacion: string;
  fuenteId: string;
  notasMetodologicas?: string;
}

export interface FuenteDocumental {
  id: string;
  autorInstitucion: string;
  fecha: string;
  titulo: string;
  tipoFuente: 'Fuente oficial' | 'Medio de comunicación' | 'Medio especializado' | 'Medio internacional' | 'Organización internacional' | 'Institución académica' | 'Encuesta';
  referencia: string;
  hitosRelacionados: string[];
}

export interface HitoTimeline {
  id: string; // e.g. "BM001"
  fecha: string; // "YYYY-MM-DD"
  start: string; // "YYYY-MM-DD" exact ISO date string
  año: number;
  mes: number;
  tipo: TipoHito;
  descripcion: string;
  actores: string;
  tema: string;
  opinionPublicaRaw: string;
  coberturaMediaticaRaw: string;
  movilizacionRaw: string;
  respuestaInstitucionalRaw: string;
  cambioNormativoRaw: string;
  relacionConOtrosHitosRaw: string;
  evidencia: string;
  fuenteIds: string[];
  carrilId: CarrilId;
  etiquetaCorta: string; // Synthesized keywords (4-6 words) for compact timeline labels without ID
  // Enhanced structured connections
  relacionesEstructuradas: RelacionItem[];
  // Opinion poll detail if applicable
  observacionOpinion?: ObservacionOpinionPublica[];
}
