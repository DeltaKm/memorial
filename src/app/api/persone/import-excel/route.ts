import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PersonaDefunta } from '@/types/persona';
import { cleanField, generateId } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Check if data already exists - allow import anyway but track duplicates
    const existingCount = await collection.countDocuments();

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
        _id: generateId(),
        id: generateId(),
        nome: cleanField(row['Nome'] || row['nome']) || '',
        cognome: cleanField(row['Cognome'] || row['cognome']) || '',
        data_decesso: cleanField(row['Decesso'] || row['decesso']) || '',
        nascita: cleanField(row['Nascita'] || row['nascita']) || '',
        padre: cleanField(row['Padre'] || row['padre']) || undefined,
        nome_madre: cleanField(row['Nom Madre'] || row['nome_madre']) || undefined,
        cognome_madre: cleanField(row['Cogn Madre'] || row['cognome_madre']) || undefined,
        nome_coniuge: cleanField(row['Nom Cs'] || row['nome_coniuge']) || undefined,
        cognome_coniuge: cleanField(row['Cogn Cs'] || row['cognome_coniuge']) || undefined,
        luogo_decesso: undefined,
        luogo_nascita: undefined,
        anno: undefined,
        eta: undefined,
        registro: undefined,
        visibile: true,
        note: undefined,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Only add if we have at least nome and cognome
      if (personaData.nome && personaData.cognome) {
        personeData.push(personaData);
      }
    }

    // Insert data into MongoDB with duplicate checking
    let imported = 0;
    let skipped = 0;

    if (personeData.length > 0) {
      for (const personaData of personeData) {
        // Check if person already exists (by nome + cognome)
        const existing = await collection.findOne({
          nome: personaData.nome,
          cognome: personaData.cognome
        });

        if (!existing) {
          // Remove _id field for insertion (MongoDB will generate it)
          const { _id, ...personaForInsert } = personaData;
          await collection.insertOne(personaForInsert);
          imported++;
        } else {
          skipped++;
        }
      }
    }

    return NextResponse.json({
      message: `Import completato! ${imported} persone importate, ${skipped} saltate (già esistenti)`,
      imported,
      skipped,
      total: personeData.length
    });

  } catch (error) {
    console.error('Error importing Excel data:', error);
    return NextResponse.json(
      { error: `Errore durante l'importazione: ${error}` },
      { status: 500 }
    );
  }
}
