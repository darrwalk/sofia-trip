import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllScheduleItems, createScheduleItem } from '@/lib/db';

export async function GET() {
  const items = getAllScheduleItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, day, startTime, endTime, category, notes, linkedEventId, linkedRestaurantId } = body;

  if (!title || !day) {
    return NextResponse.json(
      { error: 'title and day are required' },
      { status: 400 }
    );
  }

  const validDays = ['2026-05-15', '2026-05-16', '2026-05-17', '2026-05-18', '2026-05-19'];
  if (!validDays.includes(day)) {
    return NextResponse.json(
      { error: 'day must be between 2026-05-15 and 2026-05-19' },
      { status: 400 }
    );
  }

  const validCategories = ['restaurant', 'concert', 'sightseeing', 'transport', 'nightlife', 'free-time'];
  const cat = category || 'free-time';
  if (!validCategories.includes(cat)) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400 }
    );
  }

  const item = createScheduleItem({
    title,
    day,
    start_time: startTime || null,
    end_time: endTime || null,
    category: cat,
    notes: notes || null,
    linked_event_id: linkedEventId || null,
    linked_restaurant_id: linkedRestaurantId || null,
  });

  return NextResponse.json(item, { status: 201 });
}
