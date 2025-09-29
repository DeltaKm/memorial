import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET - Ottieni stato manutenzione
export async function GET() {
  try {
    const db = await getDatabase();
    const maintenanceCollection = db.collection('maintenance');
    
    // Controlla se ci sono duplicati e li sistema
    const allDocs = await maintenanceCollection.find({}).toArray();
    
    let maintenance;
    
    if (allDocs.length === 0) {
      // Nessun documento, creane uno
      const newMaintenance = {
        enabled: false,
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      const insertResult = await maintenanceCollection.insertOne(newMaintenance);
      maintenance = { ...newMaintenance, _id: insertResult.insertedId };
    } else if (allDocs.length > 1) {
      // Duplicati trovati, mantieni il primo e elimina gli altri
      console.log(`⚠️ Trovati ${allDocs.length} documenti maintenance, sistemazione in corso...`);
      maintenance = allDocs[0];
      
      // Elimina tutti tranne il primo
      const idsToDelete = allDocs.slice(1).map(doc => doc._id);
      if (idsToDelete.length > 0) {
        await maintenanceCollection.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`✅ Eliminati ${idsToDelete.length} documenti duplicati`);
      }
    } else {
      // Un solo documento, tutto ok
      maintenance = allDocs[0];
    }
    
    return NextResponse.json({
      enabled: maintenance.enabled,
      updatedAt: maintenance.updatedAt,
      updatedBy: maintenance.updatedBy
    });
  } catch (error) {
    console.error('Errore nel leggere lo stato di manutenzione:', error);
    return NextResponse.json({ enabled: false });
  }
}

// POST - Aggiorna stato manutenzione
export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Il parametro enabled deve essere un boolean' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const maintenanceCollection = db.collection('maintenance');
    
    // Aggiorna o crea il documento di manutenzione
    const updateDoc = {
      enabled,
      updatedAt: new Date(),
      updatedBy: 'admin'
    };
    
    const result = await maintenanceCollection.updateOne(
      {}, // Trova qualsiasi documento (dovrebbe essercene solo uno)
      { $set: updateDoc },
      { upsert: true } // Crea se non esiste
    );
    
    return NextResponse.json({ 
      enabled,
      message: enabled ? 'Modalità manutenzione attivata' : 'Modalità manutenzione disattivata',
      updatedAt: updateDoc.updatedAt,
      updatedBy: updateDoc.updatedBy
    });
  } catch (error) {
    console.error('Errore nel salvare lo stato di manutenzione:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
