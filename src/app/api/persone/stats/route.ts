import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Get statistics
    const totalPersone = await collection.countDocuments({});
    const personeWith1809 = await collection.countDocuments({ 
      decesso: { $regex: '1809' } 
    });
    const personeWithPadre = await collection.countDocuments({ 
      padre: { $ne: null, $exists: true } 
    });
    const personeWithMadre = await collection.countDocuments({ 
      nome_madre: { $ne: null, $exists: true } 
    });
    const personeWithConiuge = await collection.countDocuments({ 
      nome_coniuge: { $ne: null, $exists: true } 
    });

    return NextResponse.json({
      totale_persone: totalPersone,
      decessi_1809: personeWith1809,
      con_informazioni_padre: personeWithPadre,
      con_informazioni_madre: personeWithMadre,
      con_informazioni_coniuge: personeWithConiuge
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
