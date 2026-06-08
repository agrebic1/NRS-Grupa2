import Link from 'next/link';
import {
  Settings,
  Wrench,
  CheckCircle,
  Clock,
  ClipboardList,
  ClipboardCheck,
  FileText,
  MapPin,
  ArrowRight,
  Zap,
} from 'lucide-react';

type BadgeVariant = 'hitno' | 'u_toku' | 'zavrseno';

// ─── Nav ──────────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgb(var(--first-tertiary-rgb) / 0.9)',
        borderBottom: '1px solid rgb(var(--first-quaternary-rgb) / 0.3)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--first-primary)' }}
        >
          <Settings className="h-4 w-4 text-white" />
        </div>
        <span
          className="text-base font-bold tracking-tight"
          style={{ color: 'var(--first-octonary)' }}
        >
          InterServ
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/auth/login"
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-soft-beige/30"
          style={{ color: 'var(--first-primary)' }}
        >
          Prijava
        </Link>
        <Link
          href="/auth/registracija"
          className="rounded-xl bg-deep-teal px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-celestial-teal sm:px-5"
        >
          Registracija
        </Link>
      </div>
    </nav>
  );
}

// ─── Dashboard illustration ───────────────────────────────────────────────────

function StatusBadge({ variant }: { variant: BadgeVariant }) {
  const CONFIG: Record<
    BadgeVariant,
    { label: string; color: string; bg: string }
  > = {
    hitno: {
      label: 'Hitno',
      color: 'var(--first-senary)',
      bg: 'rgb(var(--first-senary-rgb) / 0.12)',
    },
    u_toku: {
      label: 'U toku',
      color: 'var(--first-secondary)',
      bg: 'rgb(var(--first-secondary-rgb) / 0.12)',
    },
    zavrseno: {
      label: 'Završeno',
      color: 'var(--first-septenary)',
      bg: 'rgb(var(--first-septenary-rgb) / 0.18)',
    },
  };
  const { label, color, bg } = CONFIG[variant];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

function DashboardIllustration() {
  const tasks: { title: string; technician: string; status: BadgeVariant }[] = [
    {
      title: 'Električni kvar - Objekat A',
      technician: 'M. Jovanović',
      status: 'hitno',
    },
    { title: 'HVAC servis - Zona 3', technician: 'L. Torić', status: 'u_toku' },
    {
      title: 'Vodoinstalaterski - St. 204',
      technician: 'R. Patel',
      status: 'zavrseno',
    },
    {
      title: 'Lift - godišnji pregled',
      technician: 'S. Kim',
      status: 'zavrseno',
    },
  ];

  return (
    <div className="relative w-full max-w-[575px]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-25 blur-3xl"
        style={{
          backgroundImage:
            'radial-gradient(circle at 70% 35%, rgba(45, 156, 178, 0.22), transparent 45%)',
        }}
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl shadow-card-lg">
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ backgroundColor: 'var(--first-octonary)' }}
        >
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--first-senary)' }}
          />
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--first-septenary)' }}
          />
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--first-secondary)' }}
          />
          <div
            className="mx-3 flex-1 rounded px-3 py-1 text-xs"
            style={{
              backgroundColor: 'rgb(255 255 255 / 0.06)',
              color: 'rgb(255 255 255 / 0.3)',
            }}
          >
            app.interserv.io/dashboard
          </div>
        </div>
        <div
          className="p-5"
          style={{ backgroundColor: 'var(--first-primary)' }}
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              {
                value: '24',
                label: 'Aktivnih',
                color: 'var(--first-septenary)',
              },
              { value: '8', label: 'Danas', color: 'var(--first-quaternary)' },
              {
                value: '97%',
                label: 'Na vrijeme',
                color: 'var(--first-secondary)',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: 'rgb(255 255 255 / 0.07)' }}
              >
                <p className="text-xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.55)' }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgb(255 255 255 / 0.06)' }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgb(var(--first-quaternary-rgb) / 0.65)' }}
            >
              Intervencije
            </p>
            <div className="flex flex-col gap-2.5">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: 'rgb(255 255 255 / 0.05)' }}
                >
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.9)' }}
                    >
                      {task.title}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.4)' }}
                    >
                      {task.technician}
                    </p>
                  </div>
                  <StatusBadge variant={task.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Floating cards */}
      <div
        className="absolute -right-4 -top-5 animate-float rounded-xl px-4 py-3 shadow-card sm:-right-6"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.5)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--first-primary)' }}
          >
            <Wrench className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: 'var(--first-octonary)' }}
            >
              Novi zadatak dodijeljen
            </p>
            <p className="text-xs" style={{ color: 'var(--first-nonary)' }}>
              HVAC - Nivo 4
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute -bottom-4 -left-4 animate-float rounded-xl px-4 py-2.5 shadow-card"
        style={{
          backgroundColor: 'var(--first-tertiary)',
          border: '1px solid rgb(var(--first-quaternary-rgb) / 0.5)',
          animationDelay: '1.2s',
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            className="h-4 w-4"
            style={{ color: 'var(--first-septenary)' }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--first-octonary)' }}
          >
            3 završena danas
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate scroll-mt-16 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-[right_center] opacity-100"
        style={{
          backgroundImage: "url('/hero-servis-bg.png')",
          filter: 'brightness(1) saturate(1.03) contrast(1.02)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(90deg, rgb(var(--first-tertiary-rgb) / 0.91) 8%, rgb(var(--first-tertiary-rgb) / 0.6) 45%, rgb(var(--first-tertiary-rgb) / 0.81) 100%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 container mx-auto flex flex-col items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:flex-row lg:gap-12">
        <div className="flex max-w-xl flex-col gap-6 lg:flex-1">
          <div
            className="w-fit rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.2)',
              color: 'var(--first-senary)',
              border: '1px solid rgb(var(--first-septenary-rgb) / 0.4)',
            }}
          >
            Servisni operativni centar
          </div>
          <h1
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
            style={{ color: 'var(--first-octonary)' }}
          >
            Servisne intervencije pod kontrolom, od prijave do izvještaja.
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--first-nonary)' }}
          >
            Od prijave kvara do gotovog izvještaja - bez izgubljenih poziva i
            ručnih tabela.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/registracija"
              className="inline-flex items-center gap-2 rounded-xl bg-deep-teal px-7 py-3.5 text-base font-semibold text-white shadow-card transition-colors duration-200 hover:bg-celestial-teal hover:shadow-card-lg"
            >
              Počnite odmah
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#funkcionalnosti"
              className="inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors duration-200 hover:border-celestial-teal"
              style={{
                backgroundColor: 'rgb(var(--first-primary-rgb) / 0.04)',
                borderColor: 'rgb(var(--first-secondary-rgb) / 0.45)',
                color: 'var(--first-octonary)',
              }}
            >
              Pogledajte demo
            </Link>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {(
                [
                  'var(--first-septenary)',
                  'var(--first-secondary)',
                  'var(--first-senary)',
                  'var(--first-quaternary)',
                ] as const
              ).map((bg, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-warm-cream"
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--first-nonary)' }}>
              <span
                className="font-semibold"
                style={{ color: 'var(--first-octonary)' }}
              >
                1.200+
              </span>{' '}
              kompanija nam vjeruje
            </p>
          </div>
        </div>
        <div className="flex w-full justify-center lg:flex-1">
          <DashboardIllustration />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const workflow = [
    {
      step: '01',
      label: 'Prijava zahtjeva',
      Icon: ClipboardList,
      color: 'var(--first-secondary)',
      body: 'Unesite kvar, lokaciju, prioritet i rok. InterServ odmah kreira servisni nalog spreman za dodjelu.',
    },
    {
      step: '02',
      label: 'Pametna dodjela',
      Icon: Zap,
      color: 'var(--first-septenary)',
      body: 'Dodijelite posao najbližem dostupnom serviseru prema lokaciji, vještini i trenutnom opterećenju.',
    },
    {
      step: '03',
      label: 'Terenski statusi',
      Icon: MapPin,
      color: 'var(--first-secondary)',
      body: 'Pratite faze rada u realnom vremenu: prihvaćeno, na putu, na lokaciji, u toku i završeno.',
    },
    {
      step: '04',
      label: 'SLA kontrola',
      Icon: Clock,
      color: 'var(--first-senary)',
      body: 'Vidite koji nalozi kasne, koji su u riziku i gdje treba reagovati prije isteka roka.',
    },
    {
      step: '05',
      label: 'Radni nalozi i checklist-e',
      Icon: ClipboardCheck,
      color: 'var(--first-secondary)',
      body: 'Serviser dobija jasne korake, evidentira materijal, dodaje slike i završava intervenciju bez papirologije.',
    },
    {
      step: '06',
      label: 'Audit trag i izvještaji',
      Icon: FileText,
      color: 'var(--first-septenary)',
      body: 'Svaka promjena, napomena, slika i potpis ostaju sačuvani u historiji i dostupni u završnom izvještaju.',
    },
  ];

  return (
    <section
      id="funkcionalnosti"
      className="py-20"
      style={{ backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.18)' }}
    >
      <div className="container mx-auto px-5 sm:px-8">
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--first-octonary)' }}
          >
            Kompletan workflow servisne intervencije
          </h2>
          <p
            className="mt-3 text-base"
            style={{ color: 'var(--first-nonary)' }}
          >
            Od prijave kvara do završnog izvještaja - InterServ vodi svaki korak
            operacije.
          </p>
        </div>

        <div
          className="mb-8 hidden items-center justify-center gap-3 lg:flex"
          aria-hidden
        >
          {workflow.map((item, index) => (
            <div key={item.step} className="flex items-center gap-3">
              <div
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: 'rgb(var(--first-septenary-rgb) / 0.4)',
                  backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.1)',
                  color: 'var(--first-secondary)',
                }}
              >
                {item.step}
              </div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--first-nonary)' }}
              >
                {item.label}
              </span>
              {index < workflow.length - 1 && (
                <div
                  className="h-px w-8"
                  style={{
                    backgroundColor: 'rgb(var(--first-quaternary-rgb) / 0.9)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workflow.map(({ step, Icon, label, body, color }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.84)',
                border: '1px solid rgb(var(--first-quaternary-rgb) / 0.55)',
                boxShadow: '0 10px 26px rgb(var(--first-primary-rgb) / 0.06)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  backgroundImage: `radial-gradient(circle at 12% 0%, color-mix(in srgb, ${color} 12%, transparent), transparent 46%)`,
                }}
                aria-hidden
              />
              <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
                <div
                  className="rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide"
                  style={{
                    borderColor: `color-mix(in srgb, ${color} 38%, rgb(var(--first-quaternary-rgb) / 0.8))`,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, white)`,
                    color: 'var(--first-octonary)',
                  }}
                >
                  {step}
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:border-transparent"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                    borderColor: `color-mix(in srgb, ${color} 30%, rgb(var(--first-quaternary-rgb) / 0.9))`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
              <h3
                className="relative z-10 mb-2 text-lg font-semibold"
                style={{ color: 'var(--first-octonary)' }}
              >
                {label}
              </h3>
              <p
                className="relative z-10 text-sm leading-relaxed"
                style={{ color: 'var(--first-nonary)' }}
              >
                {body}
              </p>
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  borderColor: `color-mix(in srgb, ${color} 45%, rgb(var(--first-quaternary-rgb) / 0.9))`,
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: '0 16px 36px rgb(var(--first-primary-rgb) / 0.12)',
                }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function StatsStrip() {
  const stats = [
    { value: '98%', label: 'Intervencija završenih na vrijeme' },
    { value: '4,2×', label: 'Brža dodjela u odnosu na ručni proces' },
    { value: '1.200+', label: 'Servisnih kompanija' },
    { value: '40.000+', label: 'Upravljanih intervencija' },
  ];
  return (
    <section className="py-14">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-5 sm:px-8 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p
              className="text-4xl font-bold"
              style={{ color: 'var(--first-primary)' }}
            >
              {value}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--first-nonary)' }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-5 sm:px-8">
        <div
          className="flex flex-col items-center gap-6 rounded-3xl px-6 py-14 text-center shadow-card-lg sm:px-8 sm:py-16"
          style={{
            backgroundColor: 'var(--first-primary)',
            backgroundImage:
              'radial-gradient(ellipse at 70% 20%, rgb(var(--first-secondary-rgb) / 0.35) 0%, transparent 60%)',
          }}
        >
          <div
            className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'rgb(var(--first-septenary-rgb) / 0.2)',
              color: 'var(--first-septenary)',
            }}
          >
            Počnite danas - bez kreditne kartice
          </div>
          <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            Spremni da uvedete red u vaše servisne operacije?
          </h2>
          <p
            className="max-w-lg text-base"
            style={{ color: 'rgb(var(--first-tertiary-rgb) / 0.7)' }}
          >
            Pridružite se 1.200+ servisnih kompanija koje su zamijenile tabele i
            telefonske pozive sa InterServ platformom.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/registracija"
              className="inline-flex items-center gap-2 rounded-xl bg-herbal-gold px-7 py-3.5 text-base font-semibold text-text-main transition-colors duration-200 hover:bg-soft-beige"
            >
              Počnite odmah besplatno
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors duration-200 hover:border-white/60"
              style={{
                borderColor: 'rgb(255 255 255 / 0.25)',
                color: 'rgb(var(--first-tertiary-rgb) / 0.85)',
              }}
            >
              Prijava
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="border-t py-8 text-center text-sm"
      style={{
        borderColor: 'rgb(var(--first-quaternary-rgb) / 0.3)',
        color: 'var(--first-nonary)',
      }}
    >
      © {new Date().getFullYear()} InterServ. Napravljeno za teren.
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

import { PostaniPartnerSection } from '@/components/landing/PostaniPartnerSection';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--first-tertiary)' }}
    >
      <NavBar />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <PostaniPartnerSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
