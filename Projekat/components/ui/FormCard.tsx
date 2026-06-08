import type { ReactNode } from 'react';

type CardMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: CardMaxWidth;
}

const MAX_WIDTH_CLASSES: Record<CardMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function FormCard({
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: FormCardProps) {
  return (
    <div
      className={`w-full ${MAX_WIDTH_CLASSES[maxWidth]} rounded-2xl p-8 shadow-card-lg`}
      style={{
        backgroundColor: 'rgb(var(--first-quinary-rgb) / 0.22)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgb(var(--first-quaternary-rgb) / 0.35)',
      }}
    >
      <div className="mb-7">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--first-octonary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-1.5 text-sm"
            style={{ color: 'var(--first-nonary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
