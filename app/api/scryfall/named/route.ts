import { NextRequest, NextResponse } from 'next/server';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fuzzy = searchParams.get('fuzzy');

  if (!fuzzy) {
    return NextResponse.json(
      { error: 'Query parameter "fuzzy" is required' },
      { status: 400 }
    );
  }

  try {
    const url = `${SCRYFALL_API_BASE}/cards/named?fuzzy=${encodeURIComponent(fuzzy)}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }
      throw new Error(`Scryfall API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in named card API route:', error);
    return NextResponse.json(
      { error: 'Failed to find card' },
      { status: 500 }
    );
  }
}
