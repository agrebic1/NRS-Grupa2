'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ServiceRequestWizard } from '@/components/forms/ServiceRequestWizard';

export default function NoviZahtjevWizardPage() {
  return (
    <AppShell uloga="korisnik">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--first-octonary)' }}
          >
            Nova prijava zahtjeva
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            Popunite detalje u 6 koraka. Što detaljniji opis unesete, brže ćemo
            reagirati.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-card sm:p-8"
          style={{
            backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
            border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <ServiceRequestWizard />
        </div>
      </div>
    </AppShell>
  );
}
