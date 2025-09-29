import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Funzione per controllare lo stato di manutenzione tramite API
async function isMaintenanceMode(req: any) {
  try {
    // Costruiamo l'URL completo per la chiamata API
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const response = await fetch(`${baseUrl}/api/maintenance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.enabled === true;
  } catch (error) {
    console.error('Errore nel controllo manutenzione:', error);
    return false; // Se c'è un errore, la manutenzione è disabilitata
  }
}

export default withAuth(
  async function middleware(req) {
    // Percorsi che non devono essere bloccati dalla manutenzione
    const allowedPaths = [
      '/maintenance',
      '/admin',
      '/api'
    ];
    
    const isAllowedPath = allowedPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );
    
    // Se non siamo in un percorso consentito, controlla la manutenzione
    if (!isAllowedPath) {
      const maintenanceEnabled = await isMaintenanceMode(req);
      
      // Se la manutenzione è attiva
      if (maintenanceEnabled) {
        // Controlla se c'è un cookie di bypass valido
        const bypassCookie = req.cookies.get('maintenance_bypass');
        
        if (!bypassCookie || !bypassCookie.value) {
          // Nessun cookie di bypass, reindirizza alla manutenzione
          return NextResponse.redirect(new URL('/maintenance', req.url));
        }
        
        // Cookie presente, permetti l'accesso (il token viene validato lato client)
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)']
};
