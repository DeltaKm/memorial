#!/usr/bin/env tsx
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'memorial_database';
const COLLECTION_NAME = 'persone_defunte';

async function addDataMatrimonioField() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non è definita nelle variabili d\'ambiente');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const updateResult = await collection.updateMany(
      { data_matrimonio: { $exists: false } },
      { $set: { data_matrimonio: null } }
    );

    console.log('✅ Aggiornamento completato');
    console.log(`Documenti modificati: ${updateResult.modifiedCount}`);
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento del campo data_matrimonio:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

addDataMatrimonioField()
  .then(() => {
    console.log('🏁 Script terminato con successo');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore imprevisto:', error);
    process.exit(1);
  });
