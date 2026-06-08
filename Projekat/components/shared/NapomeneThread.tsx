'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageSquare, Send, Headphones, Wrench } from 'lucide-react';
import type { InterventionActivity } from '@/domain/types/servisirane';

interface NapomeneThreadProps {
  aktivnosti: InterventionActivity[];
  apiEndpoint: string;
  mojaUloga: 'dispecer' | 'serviser';
  onDodana?: () => void;
  disabled?: boolean;
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

function ulogaIkona(uloga?: string) {
  if (uloga === 'dispecer') return Headphones;
  if (uloga === 'serviser') return Wrench;
  return MessageSquare;
}

function ulogaLabel(uloga?: string): string {
  if (uloga === 'dispecer') return 'Dispečer';
  if (uloga === 'serviser') return 'Serviser';
  return 'Sistem';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtVrijeme(iso: string): string {
  const d = new Date(iso);
  const danas = new Date();
  const jucer = new Date(danas);
  jucer.setDate(danas.getDate() - 1);
  const sat = d.toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (d.toDateString() === danas.toDateString()) return sat;
  if (d.toDateString() === jucer.toDateString()) return `Juče ${sat}`;
  return `${d.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit' })} ${sat}`;
}

// ─── Komponenta ───────────────────────────────────────────────────────────────

export function NapomeneThread({
  aktivnosti,
  apiEndpoint,
  mojaUloga,
  onDodana,
  disabled = false,
}: NapomeneThreadProps) {
  const napomene = aktivnosti.filter((a) => a.tip === 'napomena');
  const [tekst, setTekst] = useState('');
  const [saljemo, setSaljemo] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const MojaIkona = ulogaIkona(mojaUloga);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [napomene.length]);

  async function posalji() {
    const sadrzaj = tekst.trim();
    if (!sadrzaj) return;
    setSaljemo(true);
    setGreska(null);
    try {
      const r = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'napomena', sadrzaj }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Greška pri slanju.');
      setTekst('');
      onDodana?.();
    } catch (e) {
      setGreska(e instanceof Error ? e.message : 'Greška.');
    } finally {
      setSaljemo(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      posalji();
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'rgb(255 255 255/0.88)',
        border: '1px solid rgb(var(--first-quaternary-rgb)/0.28)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 border-b px-5 py-4"
        style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)' }}
        >
          <MessageSquare
            className="h-3.5 w-3.5"
            style={{ color: 'var(--first-secondary)' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: 'var(--first-nonary)' }}
          >
            Komunikacija
          </p>
          {/* Vizualni prikaz ko komunicira s kim */}
          <div
            className="mt-0.5 flex items-center gap-1"
            style={{ color: 'var(--first-quinary)' }}
          >
            <Headphones className="h-3 w-3" />
            <span className="text-[10px]">Dispečer</span>
            <span className="text-[10px]">↔</span>
            <Wrench className="h-3 w-3" />
            <span className="text-[10px]">Serviser</span>
          </div>
        </div>
        {napomene.length > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: 'rgb(var(--first-secondary-rgb)/0.1)',
              color: 'var(--first-secondary)',
            }}
          >
            {napomene.length}
          </span>
        )}
      </div>

      {/* ── Thread ──────────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
        style={{ minHeight: '140px', maxHeight: '380px' }}
      >
        {napomene.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'rgb(var(--first-secondary-rgb)/0.06)',
              }}
            >
              <MessageSquare
                className="h-6 w-6"
                style={{ color: 'var(--first-secondary)', opacity: 0.35 }}
              />
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Nema napomena
            </p>
            <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              Napomene su vidljive i dispečeru i serviseru
            </p>
          </div>
        ) : (
          napomene.map((n) => {
            const jeMoja =
              Boolean(n.autor?.uloga) && n.autor?.uloga === mojaUloga;
            const uloga = n.autor?.uloga;
            const RoleIkona = ulogaIkona(uloga);
            const roleLabel = ulogaLabel(uloga);
            const imeAutora = n.autor
              ? `${n.autor.ime} ${n.autor.prezime}`
              : roleLabel;

            return (
              <div
                key={n.id}
                className={`flex items-end gap-2 ${jeMoja ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* ── Avatar s role ikonom ──────────────────────────────────── */}
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: jeMoja
                      ? 'var(--first-primary)'
                      : 'rgb(var(--first-quaternary-rgb)/0.55)',
                  }}
                  title={
                    jeMoja ? `Vi (${roleLabel})` : `${imeAutora} · ${roleLabel}`
                  }
                >
                  <RoleIkona
                    className="h-3.5 w-3.5"
                    style={{ color: jeMoja ? '#fff' : 'var(--first-nonary)' }}
                  />
                </div>

                {/* ── Bubble ───────────────────────────────────────────────── */}
                <div
                  className={`flex max-w-[72%] flex-col gap-1 ${jeMoja ? 'items-end' : 'items-start'}`}
                >
                  {/* Meta red: ikona uloge + ime + vrijeme */}
                  <div className="flex items-center gap-1.5">
                    {!jeMoja && (
                      <>
                        <RoleIkona
                          className="h-2.5 w-2.5 flex-shrink-0"
                          style={{ color: 'var(--first-nonary)' }}
                        />
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: 'var(--first-nonary)' }}
                        >
                          {imeAutora}
                        </span>
                        <span style={{ color: 'var(--first-quinary)' }}>·</span>
                      </>
                    )}
                    <span
                      className="text-[10px] tabular-nums"
                      style={{ color: 'var(--first-quinary)' }}
                    >
                      {fmtVrijeme(n.created_at)}
                    </span>
                    {jeMoja && (
                      <>
                        <span style={{ color: 'var(--first-quinary)' }}>·</span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: 'var(--first-nonary)' }}
                        >
                          Vi
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bubble body */}
                  <div
                    className="px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      backgroundColor: jeMoja
                        ? 'var(--first-primary)'
                        : 'rgb(var(--first-quinary-rgb)/0.35)',
                      color: jeMoja ? '#fff' : 'var(--first-octonary)',
                      borderRadius: jeMoja
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    }}
                  >
                    {n.sadrzaj}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      {!disabled && (
        <div
          className="border-t px-4 pb-4 pt-3"
          style={{ borderColor: 'rgb(var(--first-quaternary-rgb)/0.2)' }}
        >
          {greska && (
            <p
              className="mb-2 text-xs font-medium"
              style={{ color: '#DC2626' }}
            >
              {greska}
            </p>
          )}
          <div className="flex items-end gap-2">
            {/* Role indikator u input zoni */}
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl self-end"
              style={{ backgroundColor: 'var(--first-primary)' }}
            >
              <MojaIkona className="h-3.5 w-3.5 text-white" />
            </div>
            <textarea
              rows={2}
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napišite napomenu... (Ctrl+Enter za slanje)"
              disabled={saljemo}
              className="flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm focus:outline-none disabled:opacity-60"
              style={{
                borderColor: 'rgb(var(--first-quaternary-rgb)/0.4)',
                color: 'var(--first-octonary)',
              }}
            />
            <button
              type="button"
              onClick={posalji}
              disabled={saljemo || !tekst.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--first-primary)', color: '#fff' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p
            className="mt-1.5 text-[10px]"
            style={{ color: 'var(--first-nonary)' }}
          >
            Napomene vide i dispečer i serviser
          </p>
        </div>
      )}
    </div>
  );
}
