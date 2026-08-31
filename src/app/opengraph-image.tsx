import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Podilo — Tržiště spoluvlastnických podílů nemovitostí';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          background: '#0F1F3D',
          color: '#FAF7F0',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 56,
              height: 56,
              borderRadius: 10,
              border: '2px solid #C9A15A',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              color: '#C9A15A',
            }}
          >
            P
          </div>
          <div style={{ fontSize: 32, color: '#FAF7F0' }}>Podilo</div>
        </div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#C9A15A',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 24,
          }}
        >
          Tržiště spoluvlastnických podílů
        </div>
        <div style={{ display: 'flex', fontSize: 64, lineHeight: 1.15, maxWidth: 920 }}>
          Kupujte a prodávejte podíly nemovitostí s větší jistotou
        </div>
      </div>
    ),
    { ...size }
  );
}
