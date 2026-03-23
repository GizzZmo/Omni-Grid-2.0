import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FocusHUD } from '../widgets/FocusHUD';

type AudioContextState = 'suspended' | 'running' | 'closed';

// Stub AudioContext so the noise-generation effect doesn't crash in jsdom.
// Using a class so it can be used with `new`.
const mockGain = { gain: { value: 0 }, connect: vi.fn() };
const mockFilter = { connect: vi.fn(), type: '', frequency: { value: 0 } };
const mockSource = {
  connect: vi.fn(),
  start: vi.fn(),
  loop: false,
  buffer: null,
  disconnect: vi.fn(),
};

class MockAudioContext {
  state: AudioContextState = 'suspended';
  sampleRate = 44100;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  createBuffer = vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(44100 * 2)),
  });
  createBufferSource = vi.fn().mockReturnValue(mockSource);
  createBiquadFilter = vi.fn().mockReturnValue(mockFilter);
  createGain = vi.fn().mockReturnValue(mockGain);
}

describe('FocusHUD', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the timer in FOCUS mode by default', () => {
    render(<FocusHUD />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('DEEP WORK')).toBeInTheDocument();
  });

  it('starts and pauses the timer', async () => {
    render(<FocusHUD />);
    const startBtn = screen.getByRole('button', { name: /start timer/i });
    fireEvent.click(startBtn);
    expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pause timer/i }));
    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('resets the timer', () => {
    render(<FocusHUD />);
    fireEvent.click(screen.getByRole('button', { name: /reset timer/i }));
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('cycles ambient sound: OFF → BROWN → RAIN → OFF', () => {
    render(<FocusHUD />);
    const btn = screen.getByRole('button', { name: /ambient sound: off/i });
    // OFF → BROWN_NOISE
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /ambient sound: brown/i })).toBeInTheDocument();
    // BROWN_NOISE → RAIN
    fireEvent.click(screen.getByRole('button', { name: /ambient sound: brown/i }));
    expect(screen.getByRole('button', { name: /ambient sound: rain/i })).toBeInTheDocument();
    // RAIN → OFF
    fireEvent.click(screen.getByRole('button', { name: /ambient sound: rain/i }));
    expect(screen.getByRole('button', { name: /ambient sound: off/i })).toBeInTheDocument();
  });

  it('shows volume slider when a sound is active', () => {
    render(<FocusHUD />);
    expect(screen.queryByRole('slider', { name: /ambient volume/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /ambient sound: off/i }));
    expect(screen.getByRole('slider', { name: /ambient volume/i })).toBeInTheDocument();
  });
});
