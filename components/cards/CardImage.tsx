'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/types/card';
import { RotateCw } from 'lucide-react';

interface CardImageProps {
  card: Card;
  size?: 'small' | 'normal' | 'large';
  className?: string;
}

export function CardImage({ card, size = 'normal', className = '' }: CardImageProps) {
  const [faceIndex, setFaceIndex] = useState(0);

  // 両面カードの場合、card_faces[faceIndex].image_urisを使用
  // 通常のカードの場合、card.image_urisを使用
  let imageUrl: string | undefined;

  if (card.card_faces && card.card_faces.length > 0) {
    imageUrl = card.card_faces[faceIndex]?.image_uris?.[size] ||
               card.card_faces[faceIndex]?.image_uris?.normal;
  } else {
    imageUrl = card.image_uris?.[size] || card.image_uris?.normal;
  }

  const hasTwoFaces = card.card_faces && card.card_faces.length >= 2;

  const toggleFace = () => {
    if (hasTwoFaces) {
      setFaceIndex((prev) => (prev + 1) % card.card_faces!.length);
    }
  };

  if (!imageUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={{ width: size === 'small' ? 146 : size === 'normal' ? 488 : 672, height: size === 'small' ? 204 : size === 'normal' ? 680 : 936 }}>
        <span className="text-muted-foreground text-sm">No Image</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block group">
      <Image
        src={imageUrl}
        alt={card.name}
        width={size === 'small' ? 146 : size === 'normal' ? 488 : 672}
        height={size === 'small' ? 204 : size === 'normal' ? 680 : 936}
        className={`rounded-lg ${hasTwoFaces ? 'cursor-pointer' : ''} ${className}`}
        loading="lazy"
        onClick={toggleFace}
      />
      {hasTwoFaces && (
        <button
          onClick={toggleFace}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="カードを裏返す"
        >
          <RotateCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
