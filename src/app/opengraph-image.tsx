import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Podilo — Tržiště spoluvlastnických podílů nemovitostí';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const markBuffer = await readFile(join(process.cwd(), 'public/brand/podilo-mark.png'));
  const markSrc = `data:image/png;base64,${markBuffer.toString('base64')}`;

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={56} height={62} alt="" />
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
