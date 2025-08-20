import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PersonaDefunta } from '@/types/persona';
import { cleanField, generateId } from '@/lib/utils';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Check if data already exists
    const existingCount = await collection.countDocuments({});
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Dati già presenti nel database (${existingCount} record). Import non necessario.`
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file Excel fornito' },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Use first sheet or 'Memoria Tabella'
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Process and clean data
    const personeData: PersonaDefunta[] = [];
    
    for (const row of data as Record<string, unknown>[]) {
      const personaData: PersonaDefunta = {
        id: generateId(),
        nome: cleanField(row['Nome'] || row['nome']) || '',
        cognome: cleanField(row['Cognome'] || row['cognome']) || '',
        decesso: cleanField(row['Decesso'] || row['decesso']) || '',
        nascita: cleanField(row['Nascita'] || row['nascita']) || '',
        padre: cleanField(row['Padre'] || row['padre']) || undefined,
        nome_madre: cleanField(row['Nom Madre'] || row['nome_madre']) || undefined,
        cognome_madre: cleanField(row['Cogn Madre'] || row['cognome_madre']) || undefined,
        nome_coniuge: cleanField(row['Nom Coniuge'] || row['nome_coniuge']) || undefined,
        cognome_coniuge: cleanField(row['Cogn Coniuge'] || row['cognome_coniuge']) || undefined,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Only add if we have at least nome and cognome
      if (personaData.nome && personaData.cognome) {
        personeData.push(personaData);
      }
    }

    // Insert data into MongoDB
    if (personeData.length > 0) {
      await collection.insertMany(personeData);
    }

    return NextResponse.json({
      message: `Importati ${personeData.length} record dalla tabella Excel con successo`
    });

  } catch (error) {
    console.error('Error importing Excel data:', error);
    return NextResponse.json(
      { error: `Errore durante l'importazione: ${error}` },
      { status: 500 }
    );
  }
}
