import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AestheticEngine } from '../widgets/AestheticEngine';

vi.mock('../store', () => ({
  useAppStore: vi.fn(() => ({
    setTheme: vi.fn(),
    theme: {
      name: 'Test Theme',
      colors: {
        background: '#000',
        surface: '#111',
        primary: '#0ff',
        secondary: '#f0f',
        text: '#fff',
        accent: '#0f0',
      },
      font: 'monospace',
      radius: '0px',
    },
  })),
}));

vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(() => null),
}));

describe('AestheticEngine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AestheticEngine />);
    expect(container).toBeTruthy();
  });

  it('renders TEXT and Mood Board mode tabs', () => {
    render(<AestheticEngine />);
    expect(screen.getByText('Text Prompt')).toBeTruthy();
    expect(screen.getByText('Mood Board')).toBeTruthy();
  });

  it('renders the prompt textarea in TEXT mode', () => {
    render(<AestheticEngine />);
    const textarea = screen.getByPlaceholderText(/describe the vibe/i);
    expect(textarea).toBeTruthy();
  });

  it('renders the Generate Aesthetic button', () => {
    render(<AestheticEngine />);
    expect(screen.getByText('Generate Aesthetic')).toBeTruthy();
  });

  it('switches to Mood Board mode when the tab is clicked', () => {
    render(<AestheticEngine />);
    fireEvent.click(screen.getByText('Mood Board'));
    expect(screen.getByText('Upload Image')).toBeTruthy();
  });

  it('Generate Aesthetic button is not disabled (no guard on empty prompt)', () => {
    render(<AestheticEngine />);
    // The button is only disabled when loading=true, not when prompt is empty
    const btn = screen.getByText('Generate Aesthetic');
    expect(btn.closest('button')).not.toBeDisabled();
  });

  it('displays current system state section', () => {
    render(<AestheticEngine />);
    expect(screen.getByText(/Current System State/i)).toBeTruthy();
  });
});
