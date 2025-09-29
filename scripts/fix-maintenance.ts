import { getDatabase } from '../src/lib/mongodb';

async function fixMaintenanceCollection() {
  try {
    console.log('🔧 Sistemazione collezione maintenance...');
    
    const db = await getDatabase();
    const maintenanceCollection = db.collection('maintenance');
    
    // Conta i documenti esistenti
    const count = await maintenanceCollection.countDocuments();
    console.log(`📊 Trovati ${count} documenti nella collezione maintenance`);
    
    if (count > 1) {
      // Elimina tutti i documenti
      console.log('🗑️ Eliminazione documenti duplicati...');
      await maintenanceCollection.deleteMany({});
      console.log('✅ Documenti eliminati');
    }
    
    // Crea un singolo documento di default
    const maintenanceDoc = {
      enabled: false,
      updatedAt: new Date(),
      updatedBy: 'system'
    };
    
    await maintenanceCollection.insertOne(maintenanceDoc);
    console.log('✅ Creato nuovo documento di manutenzione');
    
    // Verifica il risultato
    const finalCount = await maintenanceCollection.countDocuments();
    const document = await maintenanceCollection.findOne({});
    
    console.log(`📊 Documenti finali: ${finalCount}`);
    console.log('📄 Documento creato:', {
      enabled: document?.enabled,
      updatedAt: document?.updatedAt,
      updatedBy: document?.updatedBy
    });
    
    console.log('🎉 Sistemazione completata!');
    
  } catch (error) {
    console.error('❌ Errore nella sistemazione:', error);
  } finally {
    process.exit(0);
  }
}

// Esegui lo script
fixMaintenanceCollection();
