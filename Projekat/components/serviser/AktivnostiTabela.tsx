'use client';

import { ArrowRight } from 'lucide-react';
import type { InterventionActivity, TipAktivnosti } from '@/domain/types/servisirane';
import {
  nazivPoljaAktivnosti,
  prikazOpisaAktivnosti,
  prikazStareNoveVrijednostiAktivnosti,
} from '@/lib/servisirane/aktivnostiPrikaz';

const TIP_NAZIV: Partial<Record<TipAktivnosti | 'sla_eskalacija', string>> = {
  status_promjena:      'Status',
  napomena:             'Napomena',
  dodjela:              'Dodjela',
  evidencija:           'Evidencija',
  odbijanje:            'Odbijanje',
  promjena_izvrsioca:   'Izmjena izvršioca',
  promjena_prioriteta:  'Prioritet',
  vracanje_na_dodjelu:  'Ponovna dodjela',
  nije_rijeseno:        'Nije riješeno',
  zatvaranje:           'Zatvaranje',
  sla_eskalacija:       'SLA eskalacija',
  tim_dodjela:          'Tim',
  tim_uklanjanje:       'Tim',
  slika:                'Slika',
  sistem:               'Sistem',
  konflikt_override:    'Prioritet',
};

function formatVrijeme(iso: string): string {
  return new Date(iso).toLocaleString('bs-BA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface AktivnostiTabelaProps {
  aktivnosti: InterventionActivity[];
  ucitava?:   boolean;
}

/** US-44: hronološka tabela aktivnosti (najnovije gore). */
export function AktivnostiTabela({ aktivnosti, ucitava }: AktivnostiTabelaProps) {
  if (ucitava) {
    return (
      <p className="py-4 text-sm" style={{ color: 'var(--first-nonary)' }}>
        Učitavanje...
      </p>
    );
  }

  if (aktivnosti.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: 'var(--first-nonary)' }}>
        Nema zabilježenih aktivnosti.
      </p>
    );
  }

  const sortirane = [...aktivnosti].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="overflow-x-auto rounded-xl border"
      style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.3)' }}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.06)' }}>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Vrijeme</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Tip</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Polje</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Opis</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Stara vrijednost</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Nova vrijednost</th>
            <th className="px-3 py-2 font-semibold" style={{ color: 'var(--first-octonary)' }}>Izvršilac</th>
          </tr>
        </thead>
        <tbody>
          {sortirane.map((a) => {
            const autor = a.autor
              ? `${a.autor.ime} ${a.autor.prezime}`.trim()
              : (a.actor_role ?? 'Sistem');
            const tipNaziv = TIP_NAZIV[a.tip as TipAktivnosti] ?? a.tip;
            const { stara, nova } = prikazStareNoveVrijednostiAktivnosti(a);
            return (
              <tr
                key={a.id}
                className="border-t"
                style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
              >
                <td className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--first-nonary)' }}>
                  {formatVrijeme(a.created_at)}
                </td>
                <td className="px-3 py-2 font-medium" style={{ color: 'var(--first-octonary)' }}>
                  {tipNaziv}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium" style={{ color: 'var(--first-octonary)' }}>
                  {nazivPoljaAktivnosti(a)}
                </td>
                <td className="px-3 py-2 max-w-[280px] text-xs leading-relaxed" title={prikazOpisaAktivnosti(a)} style={{ color: 'var(--first-nonary)' }}>
                  {prikazOpisaAktivnosti(a)}
                </td>
                <td className="px-3 py-2">
                  {stara ? (
                    <span className="rounded px-1.5 py-0.5 text-xs"
                      style={{ backgroundColor: 'rgba(156,163,175,0.12)', color: '#6B7280' }}>
                      {stara}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-2">
                  {stara && nova && (
                    <ArrowRight className="mr-1 inline h-3 w-3" style={{ color: 'var(--first-nonary)' }} />
                  )}
                  {nova ? (
                    <span className="rounded px-1.5 py-0.5 text-xs"
                      style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)', color: 'var(--first-secondary)' }}>
                      {nova}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{autor}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
