import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const events = getAllEvents();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const { name, category, description, date, location, url, map_url, note } = body;

  if (!name || !category || !description) {
    return NextResponse.json(
      { error: 'name, category, and description are required' },
      { status: 400 }
    );
  }

  const event = createEvent({
    name,
    category,
    description,
    date: date || null,
    location: location || null,
    url: url || null,
    map_url: map_url || null,
    note: note || null,
  });

  return NextResponse.json(event, { status: 201 });
}
