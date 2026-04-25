import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemporalNexus } from '../widgets/TemporalNexus';

vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(),
}));

import { getGenAIClient } from '../services/geminiService';

describe('TemporalNexus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the CLOCK tab by default with a time display', () => {
    render(<TemporalNexus />);
    expect(screen.getByText(/Time/i)).toBeTruthy();
    // The clock should render a time (HH:MM:SS pattern)
    const timeEl = document.querySelector('.font-mono.tracking-tighter');
    expect(timeEl).toBeTruthy();
  });

  it('renders the tab buttons', () => {
    render(<TemporalNexus />);
    expect(screen.getByText(/Time/i)).toBeTruthy();
    expect(screen.getByText(/On This Day/i)).toBeTruthy();
  });

  it('switches to HISTORY tab on click', async () => {
    vi.mocked(getGenAIClient).mockReturnValue(null);
    render(<TemporalNexus />);

    const historyTab = screen.getByText(/On This Day/i);
    fireEvent.click(historyTab);

    // Should show API key required message when no client
    await waitFor(() => {
      expect(screen.getByText(/Temporal Uplink requires a configured API key/i)).toBeTruthy();
    });
  });

  it('shows the Historical Records header when on HISTORY tab with no API key', async () => {
    vi.mocked(getGenAIClient).mockReturnValue(null);
    render(<TemporalNexus />);

    fireEvent.click(screen.getByText(/On This Day/i));

    await waitFor(() => {
      expect(screen.getByText(/Historical Records/i)).toBeTruthy();
    });
  });

  it('displays UTC time in the CLOCK tab', () => {
    render(<TemporalNexus />);
    // UTC label
    expect(screen.getByText(/UTC:/i)).toBeTruthy();
  });
});
