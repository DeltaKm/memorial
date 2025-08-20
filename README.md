# Memorial - Next.js Full-Stack Application

Memorial è un'applicazione full-stack Next.js per la gestione di un database di persone defunte storiche. Migrata da React CRA + FastAPI Python backend.

## Funzionalità

- ✅ **CRUD completo** per persone defunte
- ✅ **Ricerca avanzata** con filtri multipli
- ✅ **Paginazione** dei risultati
- ✅ **Statistiche** del database
- ✅ **Import Excel** per caricamento dati in massa
- ✅ **UI moderna** con Tailwind CSS e Radix UI
- ✅ **Database MongoDB Atlas**
- ✅ **TypeScript** per type safety

## Tecnologie Utilizzate

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB Atlas
- **Deployment**: Vercel

## Setup Locale

1. **Clona il repository**
```bash
git clone <repository-url>
cd memorial-nextjs
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili d'ambiente**
```bash
cp env.example .env.local
```
Modifica `.env.local` con la tua stringa di connessione MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

4. **Avvia il server di sviluppo**
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Deploy su Vercel

1. **Push del codice su GitHub**
2. **Connetti il repository a Vercel**
3. **Configura le variabili d'ambiente** in Vercel:
   - `MONGODB_URI`: La tua stringa di connessione MongoDB Atlas
4. **Deploy automatico**

## Struttura del Progetto

```
src/
├── app/
│   ├── api/persone/          # API routes per CRUD
│   ├── globals.css           # Stili globali
│   ├── layout.tsx           # Layout principale
│   └── page.tsx             # Homepage
├── components/ui/           # Componenti UI Radix
├── lib/
│   ├── mongodb.ts          # Connessione MongoDB
│   └── utils.ts            # Utility functions
└── types/
    └── persona.ts          # TypeScript interfaces
```

## API Endpoints

- `GET /api/persone` - Lista persone con ricerca e paginazione
- `POST /api/persone` - Crea nuova persona
- `GET /api/persone/[id]` - Dettagli persona
- `PUT /api/persone/[id]` - Aggiorna persona
- `DELETE /api/persone/[id]` - Elimina persona
- `POST /api/persone/import-excel` - Import da file Excel
- `GET /api/persone/stats` - Statistiche database

## Sviluppo

```bash
# Sviluppo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```
