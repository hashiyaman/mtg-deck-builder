import { NextRequest, NextResponse } from 'next/server';
import { getCardById } from '@/lib/scryfall/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Card ID is required' },
      { status: 400 }
    );
  }

  try {
    const card = await getCardById(id);
    return NextResponse.json(card);
  } catch (error) {
    console.error('Error in card API route:', error);
    return NextResponse.json(
      { error: 'Failed to get card' },
      { status: 500 }
    );
  }
}
