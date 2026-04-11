import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemCore } from '../widgets/SystemCore';

vi.mock('../store', () => ({
  useAppStore: () => ({
    logs: [],
    resetAll: vi.fn(),
    addLog: vi.fn(),
    settings: { scanlines: true, sound: true, geminiApiKey: '', e2bApiKey: '' },
    toggleSetting: vi.fn(),
    visibleWidgets: ['SYSTEM', 'FOCUS_HUD'],
    toggleWidget: vi.fn(),
    setGeminiApiKey: vi.fn(),
    setE2bApiKey: vi.fn(),
  }),
}));

describe('SystemCore', () => {
  it('renders the STATUS tab by default', () => {
    render(<SystemCore />);
    expect(screen.getByText('STATUS')).toBeTruthy();
  });

  it('renders all tab buttons', () => {
    render(<SystemCore />);
    expect(screen.getByText('STATUS')).toBeTruthy();
    expect(screen.getByText('TASKS')).toBeTruthy();
    expect(screen.getByText('LOGS')).toBeTruthy();
    expect(screen.getByText('SETTINGS')).toBeTruthy();
    expect(screen.getByText('CORE')).toBeTruthy();
  });

  it('shows TASKS tab content when clicked', () => {
    render(<SystemCore />);
    fireEvent.click(screen.getByText('TASKS'));
    // TASKS tab shows PID header and running processes
    expect(screen.getByText('PID')).toBeTruthy();
    expect(screen.getByText('COMMAND')).toBeTruthy();
  });

  it('shows LOGS tab content when clicked', () => {
    render(<SystemCore />);
    fireEvent.click(screen.getByText('LOGS'));
    // The cursor indicator shows the log terminal is active
    expect(document.querySelector('.font-mono')).toBeTruthy();
  });

  it('shows SETTINGS tab content when clicked', () => {
    render(<SystemCore />);
    fireEvent.click(screen.getByText('SETTINGS'));
    expect(screen.getByText(/Gemini API Key/i)).toBeTruthy();
  });
});
