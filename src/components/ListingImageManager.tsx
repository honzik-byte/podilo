'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClientImage from '@/components/ClientImage';
import styles from './ListingImageManager.module.css';

interface ListingImageManagerProps {
  inputName: string;
  initialImages?: string[];
  minWidth?: number;
  minHeight?: number;
}

export default function ListingImageManager({
  inputName,
  initialImages = [],
  minWidth = 1200,
  minHeight = 800,
}: ListingImageManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const validateImageDimensions = async (file: File) =>
    new Promise<void>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (image.width < minWidth || image.height < minHeight) {
          reject(new Error(`Fotografie musí mít alespoň ${minWidth}×${minHeight} px.`));
          return;
        }
        resolve();
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Soubor se nepodařilo načíst jako obrázek.'));
      };
      image.src = objectUrl;
    });

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          if (file.size > 8 * 1024 * 1024) {
            throw new Error('Jedna fotografie může mít maximálně 8 MB.');
          }

          await validateImageDimensions(file);
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const signResponse = await fetch('/api/uploads/sign', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
            body: JSON.stringify({ fileName: file.name }),
          });

          if (!signResponse.ok) {
            throw new Error('Nepodařilo se připravit bezpečný upload fotografie.');
          }

          const signJson = (await signResponse.json()) as { path: string; token: string | null };
          const bucket = supabase.storage.from('listing_images');

          if (signJson.token) {
            const { error: uploadError } = await bucket.uploadToSignedUrl(signJson.path, signJson.token, file);
            if (uploadError) {
              throw uploadError;
            }
          } else {
            const { error: uploadError } = await bucket.upload(signJson.path, file);
            if (uploadError) {
              throw uploadError;
            }
          }

          const {
            data: { publicUrl },
          } = bucket.getPublicUrl(signJson.path);

          return publicUrl;
        })
      );

      setImages((current) => [...current, ...uploadedUrls]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Fotky se nepodařilo nahrát.');
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const setCover = (index: number) => {
    setImages((current) => {
      const selected = current[index];
      return [selected, ...current.filter((_, itemIndex) => itemIndex !== index)];
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className={styles.manager}>
      <div className={styles.uploadRow}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="input"
          style={{ padding: '0.6rem' }}
          onChange={(event) => {
            void uploadFiles(event.target.files);
          }}
        />
        <p className={styles.helper}>
          Nahrajte fotky, určete titulní foto a seřaďte je přesně tak, jak se mají zobrazit.
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <input type="hidden" name={inputName} value={JSON.stringify(images)} readOnly />

      {images.length > 0 ? (
        <div className={styles.grid}>
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className={styles.card}>
              <div className={styles.imageWrap}>
                <ClientImage
                  src={image}
                  alt={`Fotografie ${index + 1}`}
                  className={styles.image}
                  fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23ececf1%22%2F%3E%3C%2Fsvg%3E"
                />
                {index === 0 && <span className={styles.coverBadge}>Titulní foto</span>}
              </div>
              <div className={styles.actions}>
                {index !== 0 && (
                  <button type="button" className={styles.actionButton} onClick={() => setCover(index)}>
                    Nastavit titulní
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                >
                  Posunout vlevo
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                >
                  Posunout vpravo
                </button>
                <button type="button" className={styles.deleteButton} onClick={() => removeImage(index)}>
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>Zatím nejsou nahrané žádné fotografie.</div>
      )}

      {uploading && <p className={styles.helper}>Nahrávám fotografie...</p>}
    </div>
  );
}
