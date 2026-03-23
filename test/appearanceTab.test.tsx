import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppearanceTab } from '../components/SettingsPanel/AppearanceTab';
import * as store from '../store';

vi.mock('../store', async () => {
  const actual = await vi.importActual('../store');
  return actual;
});

describe('AppearanceTab', () => {
  beforeEach(() => {
    // Reset theme to default cyberpunk before each test
    store.useAppStore.getState().setTheme({
      name: 'Midnight Cyberpunk',
      colors: {
        background: '#020617',
        surface: '#0f172a',
        primary: '#06b6d4',
        secondary: '#d946ef',
        text: '#e2e8f0',
        accent: '#10b981',
      },
      font: 'Share Tech Mono',
      radius: '0.5rem',
    });
  });

  it('renders all 5 theme preset buttons', () => {
    render(<AppearanceTab />);
    expect(screen.getByRole('button', { name: /midnight cyberpunk/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nord/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dracula/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /minimal dark/i })).toBeInTheDocument();
  });

  it('marks the active theme as aria-pressed=true', () => {
    render(<AppearanceTab />);
    const activeBtn = screen.getByRole('button', { name: /midnight cyberpunk/i });
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
    const inactiveBtn = screen.getByRole('button', { name: /nord/i });
    expect(inactiveBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies a new theme when a preset button is clicked', () => {
    render(<AppearanceTab />);
    fireEvent.click(screen.getByRole('button', { name: /nord/i }));
    const themeName = store.useAppStore.getState().theme.name;
    expect(themeName).toBe('Nord');
  });

  it('renders color picker inputs for primary, secondary, and accent', () => {
    render(<AppearanceTab />);
    expect(screen.getByLabelText(/primary color picker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/secondary color picker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/accent color picker/i)).toBeInTheDocument();
  });

  it('updates the store when a custom color is changed', () => {
    render(<AppearanceTab />);
    const primaryInput = screen.getByLabelText(/primary color picker/i) as HTMLInputElement;
    fireEvent.change(primaryInput, { target: { value: '#ff0000' } });
    const updatedPrimary = store.useAppStore.getState().theme.colors.primary;
    expect(updatedPrimary).toBe('#ff0000');
  });
});
