'use client';

import { Shield, Truck, User, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '@/domain/types';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'korisnik',
    label: 'Korisnik',
    description: 'Podnošenje servisnih zahtjeva',
    icon: <User className="h-6 w-6" />,
  },
  {
    role: 'serviser',
    label: 'Serviser',
    description: 'Izvršavanje servisnih intervencija',
    icon: <Truck className="h-6 w-6" />,
  },
  {
    role: 'dispecer',
    label: 'Dispečer',
    description: 'Upravljanje i raspoređivanje intervencija',
    icon: <Shield className="h-6 w-6" />,
  },
  {
    role: 'admin',
    label: 'Administrator',
    description: 'Upravljanje sistemom i korisnicima',
    icon: <Settings className="h-6 w-6" />,
  },
];

interface RoleSelectFormProps {
  availableRoles: UserRole[];
  onRoleSelected: (role: UserRole) => void;
  isLoading?: boolean;
}

export function RoleSelectForm({
  availableRoles,
  onRoleSelected,
  isLoading = false,
}: RoleSelectFormProps) {
  const visibleRoleOptions = ROLE_OPTIONS.filter((option) =>
    availableRoles.includes(option.role),
  );

  return (
    <div className="flex flex-col gap-3">
      {visibleRoleOptions.map((option) => (
        <button
          key={option.role}
          type="button"
          onClick={() => onRoleSelected(option.role)}
          disabled={isLoading}
          className={[
            'flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left',
            'transition-all hover:border-blue-400 hover:bg-blue-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {option.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{option.label}</p>
            <p className="text-sm text-gray-500">{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
