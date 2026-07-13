async function getZahtjev(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dispecer/zahtjevi/${id}`, {
    cache: 'no-store'
  });
  return res.json();
}

export default async function Page({ params }: any) {
  const { zahtjev } = await getZahtjev(params.id);

  return (
    <div style={{ padding: 20 }}>
      <h1>Detalji zahtjeva</h1>

      <p><b>Opis:</b> {zahtjev.opis}</p>

      <p><b>Korisnik:</b> {zahtjev.korisnik}</p>
      <p><b>Telefon:</b> {zahtjev.telefon}</p>

      <p><b>Adresa:</b> {zahtjev.adresa}</p>

      <p><b>Kategorija:</b> {zahtjev.kategorija}</p>
      {zahtjev.potkategorija && <p><b>Potkategorija:</b> {zahtjev.potkategorija}</p>}

      <p><b>Status:</b> {zahtjev.status}</p>
      <p><b>Hitnost:</b> {zahtjev.hitnost}</p>

      {zahtjev.termin && <p><b>Termin:</b> {zahtjev.termin}</p>}

      {zahtjev.slika && (
        <div>
          <p>Prilog:</p>
          <img src={zahtjev.slika} width={200} />
        </div>
      )}

      {zahtjev.gps && <p>GPS lokacija: {zahtjev.gps}</p>}

    </div>
  );
}