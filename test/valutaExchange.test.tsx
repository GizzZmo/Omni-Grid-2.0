import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValutaExchange } from '../widgets/ValutaExchange';

describe('ValutaExchange', () => {
  it('renders currency selectors', () => {
    render(<ValutaExchange />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the amount input', () => {
    render(<ValutaExchange />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders default currencies USD and EUR', () => {
    render(<ValutaExchange />);
    // Check that the from/to selects contain USD and EUR options
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const fromSelect = selects[0];
    const options = Array.from(fromSelect.options).map(o => o.value);
    expect(options).toContain('USD');
    expect(options).toContain('EUR');
  });

  it('renders the swap button', () => {
    render(<ValutaExchange />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all supported currencies', () => {
    render(<ValutaExchange />);
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const fromSelect = selects[0];
    const options = Array.from(fromSelect.options).map(o => o.value);
    expect(options).toContain('GBP');
    expect(options).toContain('JPY');
    expect(options).toContain('CHF');
  });
});
