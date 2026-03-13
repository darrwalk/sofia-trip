import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const event = getEventById(id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();
  const updated = updateEvent(id, body);
  if (!updated) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const deleted = deleteEvent(id);
  if (!deleted) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
