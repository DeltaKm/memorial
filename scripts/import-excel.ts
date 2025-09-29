#!/usr/bin/env tsx
/**
 * Script per importare il nuovo file Excel "Memoria 1800-1820.xlsx" nel database MongoDB
 * Questo script cancella tutti i dati esistenti e importa i nuovi dati con la struttura aggiornata.
 */

import * as XLSX from 'xlsx';
import { MongoClient } from 'mongodb';
import { generateId } from '../src/lib/utils';

// Configurazione
const MONGODB_URI = "mongodb+srv://cmhsrl2017:2NABJEKyF30kROqq@cluster0.tojfi01.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = 'memorial_database';
const COLLECTION_NAME = 'persone_defunte';
const EXCEL_FILE = 'Memoria 1800-1820.xlsx';

interface ExcelRow {
  Anno?: number;
  Nome?: string;
  Cognome?: string;
  Padre?: string;
  Data_Decesso?: string;
  Luogo_Decesso?: string;
  Nascita?: string;
  Luogo_Nascita?: string;
  Età?: string;
  'Nome Madre'?: string;
  'Cognome Madre'?: string;
  Nome_Cs?: string;
  Cognome_Cs?: string;
  Registro?: string;
  'Visibile si/no'?: string;
}

interface PersonaDocument {
  id: string;
  anno?: number;
  nome: string;
  cognome: string;
  padre?: string;
  data_decesso?: string;
  luogo_decesso?: string;
  nascita?: string;
  luogo_nascita?: string;
  eta?: string;
  nome_madre?: string;
  cognome_madre?: string;
  nome_coniuge?: string;
  cognome_coniuge?: string;
  registro?: string;
  visibile: boolean;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

function cleanField(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "N.d." || value === "=" || String(value).trim() === "") {
    return undefined;
  }
  return String(value).trim();
}

function convertToBoolean(value: unknown): boolean {
  if (!value) return true; // Default: visibile
  
  const valueStr = String(value).toLowerCase().trim();
  return ['si', 'sì', 'yes', 'y', '1', 'true'].includes(valueStr);
}

async function importExcelToMongoDB(): Promise<boolean> {
  let client: MongoClient | null = null;
  
  try {
    console.log('🚀 IMPORT NUOVO FILE EXCEL - Memoria 1800-1820.xlsx');
    console.log('='.repeat(60));
    
    // Connessione a MongoDB
    console.log('🔗 Connessione a MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Test connessione
    await db.admin().ping();
    console.log('✅ Connesso a MongoDB');
    
    // Carica il file Excel
    console.log('📁 Caricamento file Excel...');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ File caricato: ${data.length} righe`);
    
    // Mostra le colonne per verifica
    console.log('\n📋 Colonne nel file Excel:');
    if (data.length > 0) {
      Object.keys(data[0]).forEach((col, i) => {
        console.log(`  ${i + 1}. ${col}`);
      });
    }
    
    // ⚠️ CANCELLAZIONE DATI ESISTENTI
    console.log('\n⚠️  ATTENZIONE: Cancellazione di tutti i dati esistenti...');
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Cancellati ${deleteResult.deletedCount} documenti esistenti`);
    
    // Preparazione dati per l'import
    console.log('\n🔄 Preparazione dati per l\'import...');
    const documenti: PersonaDocument[] = [];
    let skippedRows = 0;
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      
      try {
        // Validazione dati essenziali
        const nome = cleanField(row.Nome);
        const cognome = cleanField(row.Cognome);
        
        if (!nome || !cognome) {
          console.log(`⚠️  Riga ${index + 1}: Saltata - Nome o Cognome mancante`);
          skippedRows++;
          continue;
        }
        
        // Mapping delle colonne del nuovo Excel
        const documento: PersonaDocument = {
          id: generateId(), // UUID generato
          anno: row.Anno ? Number(row.Anno) : undefined,
          nome,
          cognome,
          padre: cleanField(row.Padre),
          data_decesso: cleanField(row.Data_Decesso),
          luogo_decesso: cleanField(row.Luogo_Decesso),
          nascita: cleanField(row.Nascita),
          luogo_nascita: cleanField(row.Luogo_Nascita),
          eta: cleanField(row.Età),
          nome_madre: cleanField(row['Nome Madre']),
          cognome_madre: cleanField(row['Cognome Madre']),
          nome_coniuge: cleanField(row.Nome_Cs),
          cognome_coniuge: cleanField(row.Cognome_Cs),
          registro: cleanField(row.Registro),
          visibile: convertToBoolean(row['Visibile si/no']),
          note: undefined, // Campo per future note
          created_at: new Date(),
          updated_at: new Date()
        };
        
        documenti.push(documento);
        
      } catch (error) {
        console.log(`❌ Errore nella riga ${index + 1}: ${error}`);
        skippedRows++;
        continue;
      }
    }
    
    console.log(`✅ Preparati ${documenti.length} documenti per l'import`);
    if (skippedRows > 0) {
      console.log(`⚠️  Saltate ${skippedRows} righe con errori`);
    }
    
    // Import in MongoDB
    if (documenti.length > 0) {
      console.log('\n📥 Import in MongoDB...');
      const insertResult = await collection.insertMany(documenti);
      console.log(`✅ Importati ${Object.keys(insertResult.insertedIds).length} documenti`);
      
      // Statistiche finali
      const totalDocs = await collection.countDocuments({});
      const visibleDocs = await collection.countDocuments({ visibile: true });
      const hiddenDocs = await collection.countDocuments({ visibile: false });
      
      console.log('\n📊 STATISTICHE FINALI:');
      console.log(`  📋 Totale documenti: ${totalDocs}`);
      console.log(`  👁️  Documenti visibili: ${visibleDocs}`);
      console.log(`  🔒 Documenti nascosti: ${hiddenDocs}`);
      
      // Verifica alcuni record
      console.log('\n🔍 PRIMI 3 RECORD IMPORTATI:');
      const sampleDocs = await collection.find({}).limit(3).toArray();
      sampleDocs.forEach((doc, i) => {
        console.log(`  ${i + 1}. ${doc.nome} ${doc.cognome} - ${doc.data_decesso || 'N/A'} - Visibile: ${doc.visibile}`);
      });
    }
    
    console.log('\n✅ IMPORT COMPLETATO CON SUCCESSO!');
    return true;
    
  } catch (error) {
    console.error('❌ Errore durante l\'import:', error);
    return false;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connessione MongoDB chiusa');
    }
  }
}

// Esecuzione script
async function main() {
  console.log('⚠️  ATTENZIONE: Questo script cancellerà TUTTI i dati esistenti nel database!');
  
  // In ambiente di produzione, richiedi conferma
  if (process.env.NODE_ENV !== 'development') {
    console.log('Per procedere, esegui: npm run import-excel:confirm');
    process.exit(1);
  }
  
  const success = await importExcelToMongoDB();
  
  if (success) {
    console.log('\n🎉 MIGRAZIONE COMPLETATA!');
    console.log('Ora puoi testare l\'applicazione con i nuovi dati.');
    process.exit(0);
  } else {
    console.log('\n💥 MIGRAZIONE FALLITA!');
    console.log('Controlla gli errori sopra e riprova.');
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main().catch(console.error);
}
