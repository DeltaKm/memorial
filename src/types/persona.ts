export interface PersonaDefunta {
  _id: string;
  id: string;
  anno?: number;
  nome: string;
  cognome: string;
  padre?: string;
  data_decesso: string;  // era 'decesso'
  luogo_decesso?: string;
  nascita: string;
  luogo_nascita?: string;
  eta?: string;
  data_matrimonio?: string | null;
  nome_madre?: string;   // mapping da 'Nome Madre'
  cognome_madre?: string; // mapping da 'Cognome Madre'
  nome_coniuge?: string; // mapping da 'Nome_Cs'
  cognome_coniuge?: string; // mapping da 'Cognome_Cs'
  registro?: string;     // nuovo campo
  visibile: boolean;     // campo per controllo visibilità pubblica
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PersonaDefuntaCreate {
  anno?: number;
  nome: string;
  cognome: string;
  padre?: string;
  data_decesso: string;
  luogo_decesso?: string;
  nascita: string;
  luogo_nascita?: string;
  eta?: string;
  data_matrimonio?: string | null;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  registro?: string;
  visibile: boolean;
  note?: string;
}

export interface PersonaDefuntaUpdate {
  anno?: number;
  nome?: string;
  cognome?: string;
  padre?: string;
  data_decesso?: string;
  luogo_decesso?: string;
  nascita?: string;
  luogo_nascita?: string;
  eta?: string;
  data_matrimonio?: string | null;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  registro?: string;
  visibile?: boolean;
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
  admin?: boolean;
}
