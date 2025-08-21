import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { PersonaDefuntaUpdate } from '@/types/persona';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Try to find by custom id first, then by MongoDB _id
    let persona = await collection.findOne({ id });
    if (!persona && ObjectId.isValid(id)) {
      persona = await collection.findOne({ _id: new ObjectId(id) });
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: PersonaDefuntaUpdate = await request.json();
    
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Check if person exists - try custom id first, then MongoDB _id
    let existingPersona = await collection.findOne({ id });
    if (!existingPersona && ObjectId.isValid(id)) {
      existingPersona = await collection.findOne({ _id: new ObjectId(id) });
    }
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
      
      // Update using the same query that found the document
      const query = existingPersona.id === id ? { id } : { _id: new ObjectId(id) };
      await collection.updateOne(query, { $set: updateData });
    }

    // Return updated person using the same query
    const query = existingPersona.id === id ? { id } : { _id: new ObjectId(id) };
    const updatedPersona = await collection.findOne(query);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const collection = db.collection('persone_defunte');

    // Try to delete by custom id first, then by MongoDB _id
    let result = await collection.deleteOne({ id });
    if (result.deletedCount === 0 && ObjectId.isValid(id)) {
      result = await collection.deleteOne({ _id: new ObjectId(id) });
    }

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
