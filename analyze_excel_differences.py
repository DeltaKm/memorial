#!/usr/bin/env python3
"""
Script per analizzare le differenze tra memoria_tabella.xlsx e Memoria 1800-1820.xlsx
"""

import pandas as pd
import sys
from pathlib import Path

def analyze_excel_files():
    # Percorsi dei file
    old_file = "memoria_tabella.xlsx"
    new_file = "Memoria 1800-1820.xlsx"
    
    try:
        # Leggi entrambi i file Excel
        print("📁 Caricamento file Excel...")
        df_old = pd.read_excel(old_file)
        df_new = pd.read_excel(new_file)
        
        print(f"✅ File caricati con successo!")
        print(f"📊 File vecchio: {len(df_old)} righe, {len(df_old.columns)} colonne")
        print(f"📊 File nuovo: {len(df_new)} righe, {len(df_new.columns)} colonne")
        print()
        
        # Mostra le colonne di entrambi i file
        print("🔍 STRUTTURA DEI FILE:")
        print("=" * 50)
        print("Colonne file vecchio (memoria_tabella.xlsx):")
        for i, col in enumerate(df_old.columns, 1):
            print(f"  {i}. {col}")
        
        print("\nColonne file nuovo (Memoria 1800-1820.xlsx):")
        for i, col in enumerate(df_new.columns, 1):
            print(f"  {i}. {col}")
        
        # Controlla se le colonne sono diverse
        old_cols = set(df_old.columns)
        new_cols = set(df_new.columns)
        
        if old_cols != new_cols:
            print("\n⚠️  DIFFERENZE NELLE COLONNE:")
            print("-" * 30)
            if new_cols - old_cols:
                print("Nuove colonne:", list(new_cols - old_cols))
            if old_cols - new_cols:
                print("Colonne rimosse:", list(old_cols - new_cols))
        else:
            print("\n✅ Le colonne sono identiche")
        
        print()
        
        # Mostra prime righe di entrambi i file per confronto
        print("🔍 PRIME 5 RIGHE DEL FILE VECCHIO:")
        print("=" * 50)
        print(df_old.head().to_string())
        
        print("\n🔍 PRIME 5 RIGHE DEL FILE NUOVO:")
        print("=" * 50)
        print(df_new.head().to_string())
        
        # Analisi delle differenze numeriche
        print(f"\n📈 STATISTICHE:")
        print("=" * 50)
        print(f"Differenza nel numero di righe: {len(df_new) - len(df_old)}")
        
        if len(df_new) > len(df_old):
            print(f"➕ Il nuovo file ha {len(df_new) - len(df_old)} righe in più")
        elif len(df_new) < len(df_old):
            print(f"➖ Il nuovo file ha {len(df_old) - len(df_new)} righe in meno")
        else:
            print("🔄 Stesso numero di righe")
        
        # Se hanno colonne simili, prova a fare un confronto più dettagliato
        common_cols = list(old_cols & new_cols)
        if common_cols and len(common_cols) > 0:
            print(f"\n🔍 CONFRONTO DETTAGLIATO (colonne comuni: {len(common_cols)}):")
            print("-" * 50)
            
            # Prova a identificare una colonna chiave per il confronto
            key_candidates = ['nome', 'cognome', 'id', 'Nome', 'Cognome', 'ID']
            key_col = None
            
            for candidate in key_candidates:
                if candidate in common_cols:
                    key_col = candidate
                    break
            
            if key_col:
                print(f"Usando '{key_col}' come chiave di confronto...")
                
                # Crea set dei valori chiave
                old_keys = set(df_old[key_col].dropna().astype(str))
                new_keys = set(df_new[key_col].dropna().astype(str))
                
                # Trova differenze
                only_in_new = new_keys - old_keys
                only_in_old = old_keys - new_keys
                common_keys = old_keys & new_keys
                
                print(f"📊 Valori comuni: {len(common_keys)}")
                print(f"➕ Solo nel nuovo file: {len(only_in_new)}")
                print(f"➖ Solo nel vecchio file: {len(only_in_old)}")
                
                if only_in_new:
                    print(f"\n🆕 NUOVE VOCI (primi 10):")
                    for item in list(only_in_new)[:10]:
                        print(f"  - {item}")
                    if len(only_in_new) > 10:
                        print(f"  ... e altre {len(only_in_new) - 10}")
                
                if only_in_old:
                    print(f"\n🗑️  VOCI RIMOSSE (primi 10):")
                    for item in list(only_in_old)[:10]:
                        print(f"  - {item}")
                    if len(only_in_old) > 10:
                        print(f"  ... e altre {len(only_in_old) - 10}")
        
        print(f"\n✅ Analisi completata!")
        
    except FileNotFoundError as e:
        print(f"❌ Errore: File non trovato - {e}")
        print("Assicurati che entrambi i file Excel siano nella directory corrente.")
    except Exception as e:
        print(f"❌ Errore durante l'analisi: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔍 ANALISI DIFFERENZE TRA FILE EXCEL")
    print("=" * 60)
    analyze_excel_files()
