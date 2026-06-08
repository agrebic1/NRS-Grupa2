'use client';

import { MiniMapa } from '@/components/shared/MiniMapa';

interface MapPreviewProps {
  adresa: string;
  lat?: number | null;
  lng?: number | null;
}

export function MapPreview({ adresa, lat, lng }: MapPreviewProps) {
  return (
    <MiniMapa
      adresa={adresa}
      lat={lat}
      lng={lng}
      visina={160}
      prikaziFooter
      kartica
    />
  );
}
