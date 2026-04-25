import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolyglotBox } from '../widgets/PolyglotBox';

vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(),
}));

import { getGenAIClient } from '../services/geminiService';

describe('PolyglotBox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders source and target language selectors', () => {
    render(<PolyglotBox />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the translate button', () => {
    render(<PolyglotBox />);
    const translateBtn = screen.getByRole('button', { name: /translate/i });
    expect(translateBtn).toBeTruthy();
  });

  it('renders the input code textarea', () => {
    render(<PolyglotBox />);
    // Default source language is Python, so placeholder is "Paste Python code here..."
    const textarea = screen.getByPlaceholderText(/Paste Python code here/i);
    expect(textarea).toBeTruthy();
  });

  it('shows no-API-key message when API client is unavailable', async () => {
    vi.mocked(getGenAIClient).mockReturnValue(null);
    render(<PolyglotBox />);

    const textarea = screen.getByPlaceholderText(/Paste Python code here/i);
    fireEvent.change(textarea, { target: { value: 'print("hello")' } });

    const translateBtn = screen.getByRole('button', { name: /translate/i });
    fireEvent.click(translateBtn);

    await vi.waitFor(() => {
      const outputArea = screen.getByPlaceholderText(
        /Translation will appear here/i
      ) as HTMLTextAreaElement;
      expect(outputArea.value).toContain('Translation unavailable');
    });
  });

  it('disables translate button when input is empty', () => {
    render(<PolyglotBox />);
    const translateBtn = screen.getByRole('button', { name: /translate/i });
    expect(translateBtn).toBeDisabled();
  });

  it('enables translate button when input has code', () => {
    render(<PolyglotBox />);
    const textarea = screen.getByPlaceholderText(/Paste Python code here/i);
    fireEvent.change(textarea, { target: { value: 'const x = 1;' } });

    const translateBtn = screen.getByRole('button', { name: /translate/i });
    expect(translateBtn).not.toBeDisabled();
  });

  it('allows changing the source language', () => {
    render(<PolyglotBox />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'JavaScript' } });
    expect((selects[0] as HTMLSelectElement).value).toBe('JavaScript');
  });
});
