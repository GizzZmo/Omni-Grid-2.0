import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignalRadio } from '../widgets/SignalRadio';

// Ensure navigator exists in the test environment
if (!globalThis.navigator) {
  Object.defineProperty(globalThis, 'navigator', {
    value: {},
    configurable: true,
  });
}

// Mock navigator.mediaDevices to avoid real mic access in tests
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
  },
  configurable: true,
});

describe('SignalRadio', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SignalRadio />);
    expect(container).toBeTruthy();
  });

  it('renders a station selector dropdown', () => {
    render(<SignalRadio />);
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
  });

  it('has "Jon Arve Sets" as first station option', () => {
    render(<SignalRadio />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.options[0].text).toContain('Jon Arve Sets');
  });

  it('has Omni-Grid Theme as a station option', () => {
    render(<SignalRadio />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options).map(o => o.text);
    expect(options.some(o => o.includes('Omni-Grid Theme'))).toBe(true);
  });

  it('renders the visualizer header canvas area', () => {
    render(<SignalRadio />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('renders the mic visualizer toggle button', () => {
    render(<SignalRadio />);
    const micBtn = document.querySelector('[title*="Visualizer"]');
    expect(micBtn).toBeTruthy();
  });

  it('switches to Suno station when selected', () => {
    render(<SignalRadio />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '⚡ Omni-Grid Theme (Suno AI)' } });
    // The Suno player section should appear
    expect(document.querySelector('audio')).toBeTruthy();
  });

  it('shows VISUALIZER STANDBY when mic is not active', () => {
    render(<SignalRadio />);
    expect(screen.getByText(/STANDBY/i)).toBeTruthy();
  });
});
