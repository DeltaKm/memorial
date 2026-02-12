import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'memorial_database';
const COLLECTION_NAME = 'persone_defunte';

async function setMostraCoiugeToFalse() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI non è definita nelle variabili d\'ambiente');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('Impostazione mostra_coniuge = false per tutti i record...');
    
    const result = await collection.updateMany(
      {}, // Tutti i documenti
      { 
        $set: { 
          mostra_coniuge: false,
          updated_at: new Date()
        } 
      }
    );

    console.log(`Aggiornati ${result.modifiedCount} record`);
    console.log(`Record totali trovati: ${result.matchedCount}`);

  } catch (error) {
    console.error('ERRORE durante l\'aggiornamento:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connessione chiusa');
  }
}

setMostraCoiugeToFalse();
