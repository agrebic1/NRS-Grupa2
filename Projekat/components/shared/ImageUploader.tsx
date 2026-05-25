'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertTriangle, ExternalLink } from 'lucide-react';

export interface SlikaUploadRezultat {
  id:        number;
  image_url: string;
}

interface ImageUploaderProps {
  zahtjevId:    number;
  evidencijaId?: number;
  onUspjeh?:    (slika: SlikaUploadRezultat) => void;
  maxFajlova?:  number;
  disabled?:    boolean;
  /** Dozvoljava brisanje uploadovanih slika s servera (serviser na terenu). */
  mozeBrisati?: boolean;
}

interface SlikaPreview {
  id:      string;
  file:    File;
  dataUrl: string;
  status:  'ceka' | 'upload' | 'ok' | 'greska';
  url?:    string;
  dbId?:   number;
  greska?: string;
}

const DOZVOLJENI_TIPOVI = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 10;

function citat(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploader({
  zahtjevId,
  evidencijaId,
  onUspjeh,
  maxFajlova = 10,
  disabled   = false,
  mozeBrisati = false,
}: ImageUploaderProps) {
  const [slike,     setSlike]     = useState<SlikaPreview[]>([]);
  const [dragging,  setDragging]  = useState(false);
  const [lightbox,  setLightbox]  = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dodajFajlove = useCallback(async (fajlovi: File[]) => {
    const validni = fajlovi.filter((f) => {
      if (!DOZVOLJENI_TIPOVI.includes(f.type)) return false;
      if (f.size > MAX_MB * 1024 * 1024) return false;
      return true;
    });

    const noveSlike: SlikaPreview[] = await Promise.all(
      validni.slice(0, maxFajlova - slike.length).map(async (file) => {
        const dataUrl = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(file);
        });
        return { id: crypto.randomUUID(), file, dataUrl, status: 'ceka' as const };
      })
    );

    setSlike((prev) => [...prev, ...noveSlike]);

    // Odmah uploaduj svaku novu sliku
    for (const slika of noveSlike) {
      uploadSliku(slika);
    }
  }, [slike.length, maxFajlova]); // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadSliku(slika: SlikaPreview) {
    setSlike((prev) =>
      prev.map((s) => (s.id === slika.id ? { ...s, status: 'upload' } : s))
    );

    const formData = new FormData();
    formData.append('file',       slika.file);
    formData.append('zahtjev_id', String(zahtjevId));
    if (evidencijaId) formData.append('evidencija_id', String(evidencijaId));
    formData.append('naziv', slika.file.name);

    try {
      const r = await fetch('/api/slike', { method: 'POST', body: formData });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri uploadu.');
      const dbId = Number(d.slika.id);
      const url  = d.slika.image_url as string;
      setSlike((prev) =>
        prev.map((s) => (s.id === slika.id ? { ...s, status: 'ok', url, dbId } : s))
      );
      onUspjeh?.({ id: dbId, image_url: url });
      // Prikaz u roditeljskoj galeriji; ukloni duplikat iz lokalnog previewa
      setSlike((prev) => prev.filter((s) => s.id !== slika.id));
    } catch (e) {
      setSlike((prev) =>
        prev.map((s) =>
          s.id === slika.id
            ? { ...s, status: 'greska', greska: e instanceof Error ? e.message : 'Greška' }
            : s
        )
      );
    }
  }

  async function ukloni(id: string) {
    const slika = slike.find((s) => s.id === id);
    if (!slika) return;

    if (slika.status === 'ok' && slika.dbId && mozeBrisati) {
      try {
        const r = await fetch(`/api/slike?id=${slika.dbId}`, { method: 'DELETE' });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Greška pri brisanju.');
      } catch {
        return;
      }
    }

    setSlike((prev) => prev.filter((s) => s.id !== id));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const fajlovi = Array.from(e.dataTransfer.files);
    dodajFajlove(fajlovi);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fajlovi = Array.from(e.target.files ?? []);
    dodajFajlove(fajlovi);
    e.target.value = '';
  }

  const mozeDodati = !disabled && slike.length < maxFajlova;

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zona */}
      {mozeDodati && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition-all"
          style={{
            borderColor: dragging
              ? 'var(--first-secondary)'
              : 'rgb(var(--first-quaternary-rgb)/0.45)',
            backgroundColor: dragging
              ? 'rgb(var(--first-secondary-rgb)/0.04)'
              : 'rgb(var(--first-quinary-rgb)/0.08)',
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}>
            <Upload className="h-5 w-5" style={{ color: 'var(--first-secondary)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--first-octonary)' }}>
              Prevuci slike ili klikni za odabir
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--first-nonary)' }}>
              JPEG, PNG, WebP, GIF - max {MAX_MB} MB po slici
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={DOZVOLJENI_TIPOVI.join(',')}
            multiple
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {/* Galerija pregleda */}
      {slike.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slike.map((s) => (
            <div key={s.id} className="group relative aspect-square overflow-hidden rounded-xl border"
              style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.dataUrl} alt={s.file.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                onClick={() => s.status === 'ok' && setLightbox(s.url ?? s.dataUrl)}
              />

              {/* Status overlay */}
              {s.status === 'upload' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {s.status === 'greska' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 px-2 text-center">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-[10px] font-medium text-white leading-tight">{s.greska}</p>
                </div>
              )}
              {s.status === 'ok' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
                  <ExternalLink className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Ukloni (lokalni preview ili upload na serveru) */}
              {!disabled && (s.status !== 'ok' || mozeBrisati) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); void ukloni(s.id); }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Info ispod slike */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3">
                <p className="truncate text-[9px] text-white/80">{citat(s.file.size)}</p>
              </div>
            </div>
          ))}

          {/* Dodaj više */}
          {mozeDodati && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.35)',
                color:       'var(--first-nonary)',
              }}>
              <ImageIcon className="h-5 w-5" />
              <span className="text-[10px]">Dodaj</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Pregled" className="max-h-[88vh] max-w-full rounded-2xl object-contain" />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
