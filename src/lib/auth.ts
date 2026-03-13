import { NextRequest, NextResponse } from 'next/server';

export function requireAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.API_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'API_SECRET not configured on server' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or malformed Authorization header. Use: Authorization: Bearer <token>' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== secret) {
    return NextResponse.json(
      { error: 'Invalid API token' },
      { status: 401 }
    );
  }

  return null; // auth passed
}
