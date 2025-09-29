import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Password per bypassare la manutenzione dalle variabili d'ambiente
const BYPASS_PASSWORD = process.env.MAINTENANCE_BYPASS_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password richiesta' },
        { status: 400 }
      );
    }

    if (password === BYPASS_PASSWORD) {
      // Genera un token temporaneo
      const token = crypto.randomBytes(32).toString('hex');
      
      return NextResponse.json({
        success: true,
        token,
        message: 'Accesso autorizzato'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Password non corretta' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Errore nel bypass manutenzione:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
