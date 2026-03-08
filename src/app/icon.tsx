import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Route segment config
export const runtime = 'edge';

// Image generation
export default function Icon({ searchParams }: { searchParams: { size?: string } }) {
  const size = parseInt(searchParams?.size || '32');
  const fontSize = Math.max(size * 0.6, 16);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: fontSize,
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        🏀
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}

// Export size and contentType for Next.js
export const contentType = 'image/png';
