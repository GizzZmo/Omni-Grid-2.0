import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RegRadar } from '../widgets/RegRadar';

describe('RegRadar', () => {
  it('renders the Regulatory Radar header', () => {
    render(<RegRadar />);
    expect(screen.getByText(/Regulatory Radar/i)).toBeTruthy();
  });

  it('shows threat level indicator', () => {
    render(<RegRadar />);
    expect(screen.getByText(/Threat Level/i)).toBeTruthy();
  });

  it('renders regulatory news items', () => {
    render(<RegRadar />);
    expect(screen.getByText(/SEC vs DeFi/i)).toBeTruthy();
    expect(screen.getByText(/MiCA Framework/i)).toBeTruthy();
    expect(screen.getByText(/FIT21 Bill/i)).toBeTruthy();
  });

  it('shows status badges for news items', () => {
    render(<RegRadar />);
    expect(screen.getByText('CRITICAL')).toBeTruthy();
    expect(screen.getByText('STABLE')).toBeTruthy();
    expect(screen.getByText('PENDING')).toBeTruthy();
  });

  it('shows jurisdiction scanning status', () => {
    render(<RegRadar />);
    expect(screen.getByText(/Scanning.*Jurisdictions/i)).toBeTruthy();
  });
});
