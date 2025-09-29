import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PersonaDefunta, PersonaDefuntaCreate, SearchResponse, SearchParams } from '@/types/persona';
import { generateId } from '@/lib/utils';

// API ADMIN - Mostra TUTTI i record (anche quelli non visibili)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: SearchParams = {
      pagina: parseInt(searchParams.get('pagina') || '1'),
      per_pagina: parseInt(searchParams.get('per_pagina') || '20'),
      ricerca: searchParams.get('ricerca') || undefined,
      nome: searchParams.get('nome') || undefined,
      cognome: searchParams.get('cognome') || undefined,
      padre: searchParams.get('padre') || undefined,
      nome_madre: searchParams.get('nome_madre') || undefined,
      cognome_madre: searchParams.get('cognome_madre') || undefined,
      nome_coniuge: searchParams.get('nome_coniuge') || undefined,
      cognome_coniuge: searchParams.get('cognome_coniuge') || undefined,
      anno_nascita: searchParams.get('anno_nascita') || undefined,
      anno_decesso: searchParams.get('anno_decesso') || undefined,
    };

    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Build query - NESSUN FILTRO VISIBILITÀ per admin
    const filter: Record<string, unknown> = {};

    // General search across multiple fields
    if (params.ricerca) {
      const regexPattern = { $regex: params.ricerca, $options: 'i' };
      filter.$or = [
        { nome: regexPattern },
        { cognome: regexPattern },
        { padre: regexPattern },
        { nome_madre: regexPattern },
        { cognome_madre: regexPattern },
        { nome_coniuge: regexPattern },
        { cognome_coniuge: regexPattern },
        { registro: regexPattern }
      ];
    }

    // Specific field searches
    if (params.nome) filter.nome = { $regex: params.nome, $options: 'i' };
    if (params.cognome) filter.cognome = { $regex: params.cognome, $options: 'i' };
    if (params.padre) filter.padre = { $regex: params.padre, $options: 'i' };
    if (params.nome_madre) filter.nome_madre = { $regex: params.nome_madre, $options: 'i' };
    if (params.cognome_madre) filter.cognome_madre = { $regex: params.cognome_madre, $options: 'i' };
    if (params.nome_coniuge) filter.nome_coniuge = { $regex: params.nome_coniuge, $options: 'i' };
    if (params.cognome_coniuge) filter.cognome_coniuge = { $regex: params.cognome_coniuge, $options: 'i' };

    // Date searches
    if (params.anno_nascita) filter.nascita = { $regex: params.anno_nascita, $options: 'i' };
    if (params.anno_decesso) filter.data_decesso = { $regex: params.anno_decesso, $options: 'i' };

    // Count total documents
    const totale = await collection.countDocuments(filter);

    // Calculate pagination
    const skip = ((params.pagina || 1) - 1) * (params.per_pagina || 20);
    const totale_pagine = Math.ceil(totale / (params.per_pagina || 20));

    // Get paginated results
    const persone = await collection
      .find(filter)
      .skip(skip)
      .limit(params.per_pagina || 20)
      .sort({ cognome: 1 })
      .toArray();

    const response: SearchResponse = {
      persone: persone.map(p => ({
        _id: p._id?.toString(),
        id: p.id,
        anno: p.anno,
        nome: p.nome,
        cognome: p.cognome,
        padre: p.padre,
        data_decesso: p.data_decesso,
        luogo_decesso: p.luogo_decesso,
        nascita: p.nascita,
        luogo_nascita: p.luogo_nascita,
        eta: p.eta,
        nome_madre: p.nome_madre,
        cognome_madre: p.cognome_madre,
        nome_coniuge: p.nome_coniuge,
        cognome_coniuge: p.cognome_coniuge,
        registro: p.registro,
        visibile: p.visibile,
        note: p.note,
        created_at: p.created_at,
        updated_at: p.updated_at
      })),
      totale,
      pagina: params.pagina || 1,
      per_pagina: params.per_pagina || 20,
      totale_pagine
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching persone (admin):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PersonaDefuntaCreate = await request.json();
    
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    const persona = {
      id: generateId(),
      anno: body.anno,
      nome: body.nome,
      cognome: body.cognome,
      padre: body.padre,
      data_decesso: body.data_decesso,
      luogo_decesso: body.luogo_decesso,
      nascita: body.nascita,
      luogo_nascita: body.luogo_nascita,
      eta: body.eta,
      nome_madre: body.nome_madre,
      cognome_madre: body.cognome_madre,
      nome_coniuge: body.nome_coniuge,
      cognome_coniuge: body.cognome_coniuge,
      registro: body.registro,
      visibile: body.visibile,
      note: body.note,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(persona);

    const createdPersona = {
      _id: result.insertedId.toString(),
      ...persona
    };

    return NextResponse.json(createdPersona, { status: 201 });
  } catch (error) {
    console.error('Error creating persona (admin):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
