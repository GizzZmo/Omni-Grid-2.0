import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent as fireEventRTL } from '@testing-library/react';
import { QuantumCalc } from '../widgets/QuantumCalc';

describe('QuantumCalc', () => {
  it('renders the display showing 0', () => {
    render(<QuantumCalc />);
    // The display div has text-xl class; find it specifically
    const displayArea = document.querySelector('.text-xl');
    expect(displayArea?.textContent).toBe('0');
  });

  it('renders number buttons', () => {
    render(<QuantumCalc />);
    // Check for digits 0-9 (there will be multiple buttons with same text due to numpad + display)
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(b => b.textContent?.trim());
    expect(buttonTexts).toContain('1');
    expect(buttonTexts).toContain('5');
    expect(buttonTexts).toContain('9');
  });

  it('renders operator buttons', () => {
    render(<QuantumCalc />);
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(b => b.textContent?.trim());
    expect(buttonTexts).toContain('+');
    expect(buttonTexts).toContain('-');
    expect(buttonTexts).toContain('=');
  });

  it('updates display when a number is pressed', () => {
    render(<QuantumCalc />);
    const btn7 = screen.getAllByRole('button').find(b => b.textContent?.trim() === '7')!;
    fireEventRTL.click(btn7);
    const displayArea = document.querySelector('.text-xl');
    expect(displayArea?.textContent).toBe('7');
  });

  it('clears display on AC button press', () => {
    render(<QuantumCalc />);
    const btn7 = screen.getAllByRole('button').find(b => b.textContent?.trim() === '7')!;
    fireEventRTL.click(btn7);
    fireEventRTL.click(screen.getByRole('button', { name: 'AC' }));
    const displayArea = document.querySelector('.text-xl');
    expect(displayArea?.textContent).toBe('0');
  });
});
