/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/LoginForm';

const mockPush = jest.fn();
const mockPrijava = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  return function MockedLink({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/services/auth/authService', () => ({
  prijaviSeEmailom: (...args) => mockPrijava(...args),
  odrediRedirectNakonPrijave: (...args) => mockRedirect(...args),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPrijava.mockReset();
    mockRedirect.mockReset();
  });

  test('submits happy path, shows success, then redirects user', async () => {
    const user = userEvent.setup();
    mockPrijava.mockResolvedValue({ user: { id: 'u1' } });
    mockRedirect.mockResolvedValue('/korisnik');
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email adresa'), 'user@example.com');
    await user.type(screen.getByLabelText('Lozinka'), 'Abcd123!');
    await user.click(screen.getByRole('button', { name: 'Prijavi se' }));

    await waitFor(() => {
      expect(mockPrijava).toHaveBeenCalledWith({
        email: 'user@example.com',
        lozinka: 'Abcd123!',
      });
    });
    expect(
      await screen.findByText('Uspješno ste prijavljeni.'),
    ).toBeInTheDocument();
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/korisnik');
      },
      { timeout: 3000 },
    );
  });

  test('shows error for invalid login', async () => {
    const user = userEvent.setup();
    mockPrijava.mockRejectedValue(new Error('Neispravni podaci za prijavu.'));
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email adresa'), 'user@example.com');
    await user.type(screen.getByLabelText('Lozinka'), 'Abcd123!');
    await user.click(screen.getByRole('button', { name: 'Prijavi se' }));

    expect(
      await screen.findByText('Neispravni podaci za prijavu.'),
    ).toBeInTheDocument();
  });
});
