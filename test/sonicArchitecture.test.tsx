import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SonicArchitecture } from '../widgets/SonicArchitecture';

const openToolsTab = () => {
  fireEvent.click(screen.getByRole('button', { name: /tools/i }));
};

describe('SonicArchitecture', () => {
  beforeEach(() => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds uploaded tracks to the playlist', () => {
    render(<SonicArchitecture />);
    openToolsTab();

    const fileInput = screen.getByLabelText(/add tracks/i) as HTMLInputElement;
    const file = new File(['audio'], 'demo.mp3', { type: 'audio/mpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getAllByText('demo.mp3').length).toBeGreaterThan(0);
    expect(screen.getByText(/now playing:/i)).toBeInTheDocument();
  });

  it('toggles loop mode and play state', () => {
    render(<SonicArchitecture />);
    openToolsTab();

    const fileInput = screen.getByLabelText(/add tracks/i) as HTMLInputElement;
    const file = new File(['audio'], 'loop.mp3', { type: 'audio/mpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const playButton = screen.getByRole('button', { name: /play or pause track/i });
    fireEvent.click(playButton);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    const loopButton = screen.getByRole('button', { name: /toggle loop/i });
    expect(loopButton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(loopButton);
    expect(loopButton).toHaveAttribute('aria-pressed', 'true');
  });
});
