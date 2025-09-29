#!/usr/bin/env python3
"""
Script per importare il nuovo file Excel "Memoria 1800-1820.xlsx" nel database MongoDB
Questo script cancella tutti i dati esistenti e importa i nuovi dati con la struttura aggiornata.
"""

import pandas as pd
import pymongo
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Carica variabili d'ambiente
load_dotenv()

def clean_field(value):
    """Pulisce i campi vuoti o con valori placeholder"""
    if pd.isna(value) or value in ["N.d.", "=", "", " "]:
        return None
    return str(value).strip()

def convert_to_boolean(value):
    """Converte il campo 'Visibile si/no' in boolean"""
    if pd.isna(value):
        return True  # Default: visibile
    
    value_str = str(value).lower().strip()
    return value_str in ['si', 'sì', 'yes', 'y', '1', 'true']

def import_excel_to_mongodb():
    """Importa il file Excel nel database MongoDB"""
    
    # Configurazione MongoDB
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print("❌ Errore: MONGODB_URI non trovato nel file .env")
        return False
    
    try:
        # Connessione a MongoDB
        print("🔗 Connessione a MongoDB...")
        client = pymongo.MongoClient(MONGODB_URI)
        db = client['memorial_database']
        collection = db['persone_defunte']
        
        # Test connessione
        client.admin.command('ping')
        print("✅ Connesso a MongoDB")
        
        # Carica il file Excel
        print("📁 Caricamento file Excel...")
        excel_file = "Memoria 1800-1820.xlsx"
        
        if not os.path.exists(excel_file):
            print(f"❌ Errore: File {excel_file} non trovato")
            return False
        
        df = pd.read_excel(excel_file)
        print(f"✅ File caricato: {len(df)} righe, {len(df.columns)} colonne")
        
        # Mostra le colonne per verifica
        print("\n📋 Colonne nel file Excel:")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i}. {col}")
        
        # ⚠️ CANCELLAZIONE DATI ESISTENTI
        print(f"\n⚠️  ATTENZIONE: Cancellazione di tutti i dati esistenti...")
        result = collection.delete_many({})
        print(f"🗑️  Cancellati {result.deleted_count} documenti esistenti")
        
        # Preparazione dati per l'import
        print("\n🔄 Preparazione dati per l'import...")
        documenti = []
        
        for index, row in df.iterrows():
            try:
                # Mapping delle colonne del nuovo Excel
                documento = {
                    'id': str(uuid.uuid4()),  # UUID generato
                    'anno': int(row['Anno']) if pd.notna(row['Anno']) else None,
                    'nome': clean_field(row['Nome']),
                    'cognome': clean_field(row['Cognome']),
                    'padre': clean_field(row['Padre']),
                    'data_decesso': clean_field(row['Data_Decesso']),
                    'luogo_decesso': clean_field(row['Luogo_Decesso']),
                    'nascita': clean_field(row['Nascita']),
                    'luogo_nascita': clean_field(row['Luogo_Nascita']),
                    'eta': clean_field(row['Età']),
                    'nome_madre': clean_field(row['Nome Madre']),
                    'cognome_madre': clean_field(row['Cognome Madre']),
                    'nome_coniuge': clean_field(row['Nome_Cs']),
                    'cognome_coniuge': clean_field(row['Cognome_Cs']),
                    'registro': clean_field(row['Registro']),
                    'visibile': convert_to_boolean(row['Visibile si/no']),
                    'note': None,  # Campo per future note
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                }
                
                # Validazione dati essenziali
                if not documento['nome'] or not documento['cognome']:
                    print(f"⚠️  Riga {index + 1}: Saltata - Nome o Cognome mancante")
                    continue
                
                documenti.append(documento)
                
            except Exception as e:
                print(f"❌ Errore nella riga {index + 1}: {e}")
                continue
        
        print(f"✅ Preparati {len(documenti)} documenti per l'import")
        
        # Import in MongoDB
        if documenti:
            print("\n📥 Import in MongoDB...")
            result = collection.insert_many(documenti)
            print(f"✅ Importati {len(result.inserted_ids)} documenti")
            
            # Statistiche finali
            total_docs = collection.count_documents({})
            visible_docs = collection.count_documents({'visibile': True})
            hidden_docs = collection.count_documents({'visibile': False})
            
            print(f"\n📊 STATISTICHE FINALI:")
            print(f"  📋 Totale documenti: {total_docs}")
            print(f"  👁️  Documenti visibili: {visible_docs}")
            print(f"  🔒 Documenti nascosti: {hidden_docs}")
            
            # Verifica alcuni record
            print(f"\n🔍 PRIMI 3 RECORD IMPORTATI:")
            for i, doc in enumerate(collection.find().limit(3)):
                print(f"  {i+1}. {doc['nome']} {doc['cognome']} - {doc['data_decesso']} - Visibile: {doc['visibile']}")
        
        client.close()
        print(f"\n✅ IMPORT COMPLETATO CON SUCCESSO!")
        return True
        
    except Exception as e:
        print(f"❌ Errore durante l'import: {e}")
        return False

if __name__ == "__main__":
    print("🚀 IMPORT NUOVO FILE EXCEL - Memoria 1800-1820.xlsx")
    print("=" * 60)
    
    # Conferma prima di procedere
    print("⚠️  ATTENZIONE: Questo script cancellerà TUTTI i dati esistenti nel database!")
    conferma = input("Vuoi continuare? (scrivi 'CONFERMA' per procedere): ")
    
    if conferma != 'CONFERMA':
        print("❌ Operazione annullata dall'utente")
        exit(1)
    
    success = import_excel_to_mongodb()
    if success:
        print("\n🎉 MIGRAZIONE COMPLETATA!")
        print("Ora puoi testare l'applicazione con i nuovi dati.")
    else:
        print("\n💥 MIGRAZIONE FALLITA!")
        print("Controlla gli errori sopra e riprova.")
