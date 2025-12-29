import { NextRequest, NextResponse } from 'next/server';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setCode: string; collectorNumber: string }> }
) {
  const { setCode, collectorNumber } = await params;

  try {
    const url = `${SCRYFALL_API_BASE}/cards/${setCode}/${collectorNumber}`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}
