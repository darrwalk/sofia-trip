import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantById, updateRestaurant, deleteRestaurant } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const restaurant = getRestaurantById(id);
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  return NextResponse.json(restaurant);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();
  const updated = updateRestaurant(id, body);
  if (!updated) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const deleted = deleteRestaurant(id);
  if (!deleted) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
