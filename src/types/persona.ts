export interface PersonaDefunta {
  _id: string;
  id: string;
  nome: string;
  cognome: string;
  decesso: string;
  nascita: string;
  padre?: string;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PersonaDefuntaCreate {
  nome: string;
  cognome: string;
  decesso: string;
  nascita: string;
  padre?: string;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  note?: string;
}

export interface PersonaDefuntaUpdate {
  nome?: string;
  cognome?: string;
  decesso?: string;
  nascita?: string;
  padre?: string;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
}

export interface SearchResponse {
  persone: PersonaDefunta[];
  totale: number;
  pagina: number;
  per_pagina: number;
  totale_pagine: number;
}

export interface SearchParams {
  pagina?: number;
  per_pagina?: number;
  ricerca?: string;
  nome?: string;
  cognome?: string;
  padre?: string;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  anno_nascita?: string;
  anno_decesso?: string;
}
