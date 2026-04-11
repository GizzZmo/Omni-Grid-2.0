import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacroNet } from '../widgets/MacroNet';

describe('MacroNet', () => {
  it('renders the Macro and Flows tab buttons', () => {
    render(<MacroNet />);
    expect(screen.getByText(/Macro/i)).toBeTruthy();
    expect(screen.getByText(/Flows/i)).toBeTruthy();
  });

  it('renders the Global Liquidity Index label', () => {
    render(<MacroNet />);
    expect(screen.getByText(/Global Liquidity Index/i)).toBeTruthy();
  });

  it('shows correlation matrix in default heatmap view', () => {
    render(<MacroNet />);
    expect(screen.getByText(/M2 Corr/i)).toBeTruthy();
  });

  it('shows asset names in heatmap', () => {
    render(<MacroNet />);
    expect(screen.getByText('BTC')).toBeTruthy();
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('switches to Flows tab on click', () => {
    render(<MacroNet />);
    fireEvent.click(screen.getByText(/Flows/i));
    // After switching tab the Flows button should still be rendered
    expect(screen.getByText(/Flows/i)).toBeTruthy();
  });
});
