#!/usr/bin/env tsx
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'memorial_database';
const COLLECTION_NAME = 'persone_defunte';

const valoriDaNormalizzare = [
  'San Pietro',
  'S.Pietro',
  'San Nicola',
  'S.Nicola',
  'San Rufo',
  'S.Rufo',
  'Cattedrale'
];

async function normalizeRegistro() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non è definita nelle variabili d\'ambiente');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const filtro = {
      $or: [
        {
          registro: {
            $in: valoriDaNormalizzare
          }
        },
        {
          registro: {
            $regex: /^cattedrale\b/i
          }
        }
      ]
    };

    const update = {
      $set: { registro: 'Reg. Parrocchiale' }
    };

    const { matchedCount, modifiedCount } = await collection.updateMany(filtro, update);

    console.log(`✅ Documenti trovati: ${matchedCount}`);
    console.log(`✏️  Documenti aggiornati: ${modifiedCount}`);
  } catch (error) {
    console.error('❌ Errore durante la normalizzazione:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

normalizeRegistro().then(() => {
  console.log('🏁 Normalizzazione completata');
  process.exit(0);
});
