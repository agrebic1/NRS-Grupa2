// Email utility - koristi Resend API ako je RESEND_API_KEY konfigurisan,
// inače loguje email sadržaj u konzolu (development fallback).

interface EmailOpcije {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail(opcije: EmailOpcije): Promise<{ success: boolean; greska?: string }> {
  const apiKey   = process.env.RESEND_API_KEY;
  const fromAddr = process.env.EMAIL_FROM ?? 'InterServ <noreply@interserv.ba>';

  if (!apiKey) {
    // Fallback: ispis u konzolu - za development bez konfiguriranog email servisa
    console.log('\n━━━ [EMAIL - RESEND_API_KEY nije konfigurisan] ━━━');
    console.log(`  TO:      ${opcije.to}`);
    console.log(`  SUBJECT: ${opcije.subject}`);
    console.log(`  SADRŽAJ: ${opcije.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true };
  }

  try {
    const odgovor = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    fromAddr,
        to:      opcije.to,
        subject: opcije.subject,
        html:    opcije.html,
      }),
    });

    if (!odgovor.ok) {
      const err = await odgovor.json().catch(() => ({}));
      return {
        success: false,
        greska:  (err as { message?: string }).message ?? 'Greška pri slanju emaila.',
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      greska:  err instanceof Error ? err.message : 'Greška pri slanju emaila.',
    };
  }
}

// ─── HTML šablon za email odobrene prijave ────────────────────────────────────

export function kreirajEmailOdobrenja(params: {
  ime:               string;
  prezime:           string;
  email:             string;
  privremena_lozinka: string;
  uloga:             string;
}): string {
  const { ime, prezime, email, privremena_lozinka, uloga } = params;

  return `<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prijava odobrena - InterServ</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;border:1px solid #dfe7f2;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#102541;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                InterServ
              </p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">
                Upravljanje servisnim intervencijama
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0b1526;">
                Prijava odobrena! ✓
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#617089;line-height:1.6;">
                Dragi/a <strong style="color:#0b1526;">${ime} ${prezime}</strong>,
                vaša prijava za partnerstvo je pregledana i odobrena.
                U sistemu ste registrovani kao <strong>${uloga}</strong>.
              </p>

              <!-- Credentials box -->
              <div style="background:#f0f4fa;border:1px solid #dfe7f2;border-radius:12px;
                          padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;
                           text-transform:uppercase;letter-spacing:0.06em;color:#617089;">
                  Vaši pristupni podaci
                </p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#617089;width:100px;">Email:</td>
                    <td style="padding:6px 0;font-size:14px;color:#0b1526;font-weight:600;">
                      ${email}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#617089;">Lozinka:</td>
                    <td style="padding:6px 0;">
                      <code style="font-size:15px;font-weight:700;color:#2D5B9F;
                                   background:#e8eef7;padding:4px 10px;border-radius:6px;
                                   letter-spacing:0.04em;">
                        ${privremena_lozinka}
                      </code>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Warning -->
              <div style="background:#fff8ec;border:1px solid rgba(217,132,0,0.3);
                          border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#a16207;line-height:1.5;">
                  ⚠️ <strong>Važno:</strong> Ovo je privremena lozinka.
                  Pri prvom prijavljivanju bit ćete upitani da je promijenite u vlastitu.
                  Čuvajte ove podatke na sigurnom.
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://interserv.ba'}/auth/login"
                   style="display:inline-block;background:#102541;color:#ffffff;
                          font-size:15px;font-weight:600;padding:14px 32px;
                          border-radius:10px;text-decoration:none;letter-spacing:-0.2px;">
                  Prijavite se u sistem →
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#617089;line-height:1.6;border-top:1px solid #dfe7f2;padding-top:20px;">
                Ako imate pitanja, kontaktirajte nas na
                <a href="mailto:podrska@interserv.ba" style="color:#2D5B9F;">
                  podrska@interserv.ba
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f3ee;padding:16px 32px;
                       border-top:1px solid #dfe7f2;text-align:center;">
              <p style="margin:0;font-size:11px;color:#617089;">
                © ${new Date().getFullYear()} InterServ - Automatska obavijest. Molimo ne odgovarajte na ovaj email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function kreirajEmailInternogNaloga(params: {
  ime: string;
  prezime: string;
  email: string;
  privremena_lozinka: string;
  uloga: string;
}): string {
  const { ime, prezime, email, privremena_lozinka, uloga } = params;

  return `<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kreiran interni nalog - InterServ</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;border:1px solid #dfe7f2;overflow:hidden;">
          <tr>
            <td style="background:#102541;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">InterServ</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Pristupni podaci internog naloga</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0b1526;">Nalog je uspjesno kreiran ✓</p>
              <p style="margin:0 0 24px;font-size:15px;color:#617089;line-height:1.6;">
                Postovani/a <strong style="color:#0b1526;">${ime} ${prezime}</strong>, administrator vam je kreirao interni nalog sa ulogom <strong>${uloga}</strong>.
              </p>
              <div style="background:#f0f4fa;border:1px solid #dfe7f2;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#617089;">
                  Pristupni podaci
                </p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#617089;width:100px;">Email:</td>
                    <td style="padding:6px 0;font-size:14px;color:#0b1526;font-weight:600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#617089;">Lozinka:</td>
                    <td style="padding:6px 0;">
                      <code style="font-size:15px;font-weight:700;color:#2D5B9F;background:#e8eef7;padding:4px 10px;border-radius:6px;letter-spacing:0.04em;">
                        ${privremena_lozinka}
                      </code>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="margin:0;font-size:13px;color:#617089;line-height:1.6;border-top:1px solid #dfe7f2;padding-top:20px;">
                Pri prvom prijavljivanju promijenite privremenu lozinku.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
