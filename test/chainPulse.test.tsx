import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChainPulse } from '../widgets/ChainPulse';

describe('ChainPulse', () => {
  it('renders the Logic Layer Pulse header', () => {
    render(<ChainPulse />);
    expect(screen.getByText(/Logic Layer Pulse/i)).toBeTruthy();
  });

  it('shows TPS and blob fees label', () => {
    render(<ChainPulse />);
    expect(screen.getByText(/TPS & Blob Fees/i)).toBeTruthy();
  });

  it('renders ETH modular stack section', () => {
    render(<ChainPulse />);
    expect(screen.getByText(/ETH Modular Stack/i)).toBeTruthy();
  });

  it('renders layer 2 networks', () => {
    render(<ChainPulse />);
    expect(screen.getByText(/Base \(Coinbase\)/i)).toBeTruthy();
    expect(screen.getByText(/Arbitrum One/i)).toBeTruthy();
  });

  it('renders Solana velocity section', () => {
    render(<ChainPulse />);
    expect(screen.getByText(/Monolithic Velocity/i)).toBeTruthy();
    expect(screen.getByText(/TPS \(True\)/i)).toBeTruthy();
  });
});
