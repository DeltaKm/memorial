import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PersonaDefuntaUpdate } from '@/types/persona';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    const persona = await collection.findOne({ id: params.id });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error('Error fetching persona:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: PersonaDefuntaUpdate = await request.json();
    
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Check if person exists
    const existingPersona = await collection.findOne({ id: params.id });
    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona non trovata' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    Object.keys(body).forEach(key => {
      if (body[key as keyof PersonaDefuntaUpdate] !== undefined) {
        updateData[key] = body[key as keyof PersonaDefuntaUpdate];
      }
    });

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date();
      await collection.updateOne(
        { id: params.id },
        { $set: updateData }
      );
    }

    // Return updated person
    const updatedPersona = await collection.findOne({ id: params.id });
    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error('Error updating persona:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    const result = await collection.deleteOne({ id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Persona non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Persona eliminata con successo' });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
