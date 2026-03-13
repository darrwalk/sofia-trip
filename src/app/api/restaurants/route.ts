import { NextRequest, NextResponse } from 'next/server';
import { getAllRestaurants, createRestaurant } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const restaurants = getAllRestaurants();
  return NextResponse.json(restaurants);
}

export async function POST(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const {
    rank, name, address, price_range, description,
    website, phone, note, category,
    tripadvisor_url, google_maps_url,
    score_authenticity, score_experience, score_food_quality,
    score_exclusivity, score_value
  } = body;

  if (!name || !address || !price_range || !description) {
    return NextResponse.json(
      { error: 'name, address, price_range, and description are required' },
      { status: 400 }
    );
  }

  const restaurant = createRestaurant({
    rank: rank || 0,
    name,
    address,
    price_range,
    description,
    website: website || null,
    phone: phone || null,
    note: note || null,
    category: category || 'traditional',
    tripadvisor_url: tripadvisor_url || null,
    google_maps_url: google_maps_url || null,
    score_authenticity: score_authenticity ?? 3,
    score_experience: score_experience ?? 3,
    score_food_quality: score_food_quality ?? 3,
    score_exclusivity: score_exclusivity ?? 3,
    score_value: score_value ?? 3,
  });

  return NextResponse.json(restaurant, { status: 201 });
}
