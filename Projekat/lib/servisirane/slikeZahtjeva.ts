function pushUrl(
  out: string[],
  seen: Set<string>,
  u: string | null | undefined,
) {
  const t = u?.trim();
  if (!t || seen.has(t)) return;
  seen.add(t);
  out.push(t);
}

function pushFromUnknown(seen: Set<string>, out: string[], val: unknown) {
  if (val == null) return;
  if (typeof val === 'string') {
    pushUrl(out, seen, val);
    return;
  }
  if (!Array.isArray(val)) return;
  for (const item of val) {
    if (typeof item === 'string') pushUrl(out, seen, item);
    else if (item && typeof item === 'object' && 'url' in item) {
      const u = (item as { url?: unknown }).url;
      if (typeof u === 'string') pushUrl(out, seen, u);
    }
  }
}

type ZahtjevSaSlikama = {
  photo_url?: string | null;
  attachment_image_urls?: string[] | null;
  images?: string[] | null;
  photos?: string[] | null;
  attachment_urls?: string[] | null;
};

/**
 * URL-ovi priloženih slika - spaja photo_url, poznata polja i uobičajene JSON ključeve.
 */
export function urlsPrilozenihSlika(
  zahtjev: ZahtjevSaSlikama & Record<string, unknown>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  pushUrl(out, seen, zahtjev.photo_url);
  pushFromUnknown(seen, out, zahtjev.attachment_image_urls);
  pushFromUnknown(seen, out, zahtjev.images);
  pushFromUnknown(seen, out, zahtjev.photos);
  pushFromUnknown(seen, out, zahtjev.attachment_urls);

  for (const k of ['attachments', 'image_urls', 'photo_urls'] as const) {
    if (Object.prototype.hasOwnProperty.call(zahtjev, k)) {
      pushFromUnknown(seen, out, zahtjev[k]);
    }
  }

  return out;
}
