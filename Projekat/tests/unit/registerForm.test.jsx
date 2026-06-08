/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { PotrebnaPotvrdaEmailaError } from '@/services/auth/authService';

const mockReplace = jest.fn();
const mockRegistracija = jest.fn();
const mockOdrediRedirect = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/services/auth/authService', () => {
  const stvarni = jest.requireActual('@/services/auth/authService');
  return {
    ...stvarni,
    registrujKorisnika: (...args) => mockRegistracija(...args),
    odrediRedirectNakonPrijave: (...args) => mockOdrediRedirect(...args),
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRegistracija.mockReset();
    mockOdrediRedirect.mockReset();
    mockOdrediRedirect.mockResolvedValue('/korisnik');
  });

  test('moves between steps forward and back', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Ime'), 'Amina');
    await user.type(screen.getByLabelText('Prezime'), 'Hodzic');
    await user.type(screen.getByLabelText('Email adresa'), 'amina@example.com');
    await user.type(screen.getByLabelText('Broj telefona'), '+38761111222');
    await user.click(screen.getByRole('button', { name: 'Nastavi' }));

    expect(await screen.findByLabelText('Lozinka')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nazad' }));
    expect(await screen.findByLabelText('Ime')).toBeInTheDocument();
  });

  test('valid submission calls API and redirects', async () => {
    const user = userEvent.setup();
    mockRegistracija.mockResolvedValue({ user: { id: 'u1' } });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Ime'), 'Amina');
    await user.type(screen.getByLabelText('Prezime'), 'Hodzic');
    await user.type(screen.getByLabelText('Email adresa'), 'amina@example.com');
    await user.type(screen.getByLabelText('Broj telefona'), '+38761111222');
    await user.click(screen.getByRole('button', { name: 'Nastavi' }));

    await user.type(await screen.findByLabelText('Lozinka'), 'Abcd123!');
    await user.type(screen.getByLabelText('Potvrda lozinke'), 'Abcd123!');
    await user.click(screen.getByRole('button', { name: 'Kreiraj nalog' }));

    await waitFor(() => expect(mockRegistracija).toHaveBeenCalled());
    await waitFor(() => expect(mockOdrediRedirect).toHaveBeenCalledWith('u1'));
    expect(mockReplace).toHaveBeenCalledWith('/korisnik');
  });

  test('shows error on failed registration', async () => {
    const user = userEvent.setup();
    mockRegistracija.mockRejectedValue(
      new Error('Kreiranje naloga nije uspjelo.'),
    );
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Ime'), 'Amina');
    await user.type(screen.getByLabelText('Prezime'), 'Hodzic');
    await user.type(screen.getByLabelText('Email adresa'), 'amina@example.com');
    await user.type(screen.getByLabelText('Broj telefona'), '+38761111222');
    await user.click(screen.getByRole('button', { name: 'Nastavi' }));

    await user.type(await screen.findByLabelText('Lozinka'), 'Abcd123!');
    await user.type(screen.getByLabelText('Potvrda lozinke'), 'Abcd123!');
    await user.click(screen.getByRole('button', { name: 'Kreiraj nalog' }));

    expect(
      await screen.findByText('Kreiranje naloga nije uspjelo.'),
    ).toBeInTheDocument();
  });

  test('after registration needing email confirmation, shows verify screen and countdown', async () => {
    const user = userEvent.setup();
    mockRegistracija.mockRejectedValueOnce(
      new PotrebnaPotvrdaEmailaError('potvrda@example.com'),
    );
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Ime'), 'Amina');
    await user.type(screen.getByLabelText('Prezime'), 'Hodzic');
    await user.type(
      screen.getByLabelText('Email adresa'),
      'potvrda@example.com',
    );
    await user.type(screen.getByLabelText('Broj telefona'), '+38761111222');
    await user.click(screen.getByRole('button', { name: 'Nastavi' }));

    await user.type(await screen.findByLabelText('Lozinka'), 'Abcd123!');
    await user.type(screen.getByLabelText('Potvrda lozinke'), 'Abcd123!');
    await user.click(screen.getByRole('button', { name: 'Kreiraj nalog' }));

    expect(
      await screen.findByRole('heading', { name: /Provjerite email/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/potvrda@example\.com/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pošalji novi link' }),
    ).toBeDisabled();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });
});
