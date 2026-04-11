import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SunoPlayer } from '../widgets/SunoPlayer';

// scrollIntoView and HTMLMediaElement are not implemented in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
  window.HTMLMediaElement.prototype.load = vi.fn();
});

describe('SunoPlayer', () => {
  it('renders Player and Suno Embed tab buttons', () => {
    render(<SunoPlayer />);
    expect(screen.getByText(/Player/i)).toBeTruthy();
    expect(screen.getByText(/Suno Embed/i)).toBeTruthy();
  });

  it('renders play button in Player tab', () => {
    render(<SunoPlayer />);
    // The play button has aria-label "Play" — use that to get exactly one
    const playBtn = screen.getByLabelText(/^Play$/i);
    expect(playBtn).toBeTruthy();
  });

  it('renders the volume slider in Player tab', () => {
    render(<SunoPlayer />);
    const volumeSlider = screen.getByRole('slider', { name: /Volume/i });
    expect(volumeSlider).toBeTruthy();
  });

  it('renders the seek slider in Player tab', () => {
    render(<SunoPlayer />);
    const seekSlider = screen.getByRole('slider', { name: /Seek/i });
    expect(seekSlider).toBeTruthy();
  });

  it('renders the Open on Suno link pointing to the correct song', () => {
    render(<SunoPlayer />);
    const link = screen.getByText(/Open on Suno\.com/i).closest('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toContain('652af4a0-378e-4967-a762-09b9ed7ac9fb');
  });

  it('switches to the Suno Embed view on tab click', () => {
    render(<SunoPlayer />);
    fireEvent.click(screen.getByText(/Suno Embed/i));
    // The iframe should appear in the embed view
    const iframe = document.querySelector('iframe[title="Suno Song Embed"]');
    expect(iframe).toBeTruthy();
  });

  it('shows the song title in the Player tab', () => {
    render(<SunoPlayer />);
    // Title uses an em-dash character
    expect(screen.getByText(/Omni-Grid 2/)).toBeTruthy();
    // Artist tag
    expect(screen.getByText(/Omni-Grid AI/)).toBeTruthy();
  });
});
