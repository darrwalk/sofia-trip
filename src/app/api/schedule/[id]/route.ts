import { NextRequest, NextResponse } from 'next/server';
import { getScheduleItemById, updateScheduleItem, deleteScheduleItem } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const item = getScheduleItemById(id);
  if (!item) return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 });

  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.day !== undefined) updates.day = body.day;
  if (body.startTime !== undefined) updates.start_time = body.startTime;
  if (body.endTime !== undefined) updates.end_time = body.endTime;
  if (body.category !== undefined) updates.category = body.category;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.linkedEventId !== undefined) updates.linked_event_id = body.linkedEventId;
  if (body.linkedRestaurantId !== undefined) updates.linked_restaurant_id = body.linkedRestaurantId;

  const updated = updateScheduleItem(id, updates);
  if (!updated) return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const deleted = deleteScheduleItem(id);
  if (!deleted) return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
