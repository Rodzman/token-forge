import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Studio } from './Studio';
import { STORAGE_KEY } from '@/lib/storage';
import { resetTokensStore } from '@/lib/tokens-store';

describe('<Studio />', () => {
  beforeEach(() => {
    localStorage.clear();
    resetTokensStore();
  });

  it('renders the default tokens and the contrast matrix', () => {
    render(<Studio />);
    expect(screen.getByRole('tab', { name: 'Colours', selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Hex for primary')).toHaveValue('#2f6fed');
    // text on surface: dark on white, AAA
    const cell = screen.getByTestId('cell-text-surface');
    expect(within(cell).getByText('AAA')).toBeInTheDocument();
  });

  it('grades a pair as Fail and can fix it in place', async () => {
    const user = userEvent.setup();
    render(<Studio />);

    const hex = screen.getByLabelText('Hex for text-muted');
    await user.clear(hex);
    await user.type(hex, '#bbbbbb'); // light grey on white: fails AA

    const cell = screen.getByTestId('cell-text-muted-surface');
    expect(within(cell).getByText('Fail')).toBeInTheDocument();

    await user.click(within(cell).getByRole('button', { name: /fix →/ }));
    expect(within(cell).queryByText('Fail')).not.toBeInTheDocument();
    expect(within(cell).getByText(/^AA/)).toBeInTheDocument();
    expect(screen.getByLabelText('Hex for text-muted')).not.toHaveValue('#bbbbbb');
  });

  it('persists edits to localStorage and restores them', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Studio />);
    const name = screen.getByLabelText('Token set name');
    await user.clear(name);
    await user.type(name, 'Brand 2026');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').name).toBe('Brand 2026');
    unmount();
    resetTokensStore(); // simulate a fresh page load

    render(<Studio />);
    expect(await screen.findByDisplayValue('Brand 2026')).toBeInTheDocument();
  });

  it('exports CSS variables and imports validated JSON', async () => {
    const user = userEvent.setup();
    render(<Studio />);
    await user.click(screen.getByRole('tab', { name: 'Import / export' }));
    expect(screen.getByLabelText('Exported tokens')).toHaveTextContent('--color-primary: #2f6fed;');

    await user.click(screen.getByRole('button', { name: 'Tailwind v4 @theme' }));
    expect(screen.getByLabelText('Exported tokens')).toHaveTextContent('@theme {');

    const textarea = screen.getByLabelText('Tokens JSON to import');
    await user.click(textarea);
    await user.paste('{"name":"x"}');
    await user.click(screen.getByRole('button', { name: 'Import tokens' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/colors/);
  });

  it('shows the type scale for the chosen ratio', async () => {
    const user = userEvent.setup();
    render(<Studio />);
    await user.click(screen.getByRole('tab', { name: 'Typography' }));
    expect(screen.getByText('25px · 1.563rem')).toBeInTheDocument(); // xl at 16 * 1.25^2
  });
});
