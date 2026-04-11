import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebTerminal } from '../widgets/WebTerminal';

// scrollIntoView is not implemented in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('WebTerminal', () => {
  it('renders the welcome messages', () => {
    render(<WebTerminal />);
    expect(screen.getByText(/Omni-Grid JS Runtime/i)).toBeTruthy();
    expect(screen.getByText(/Type JavaScript code/i)).toBeTruthy();
  });

  it('has an input field with the correct placeholder', () => {
    render(<WebTerminal />);
    expect(screen.getByPlaceholderText(/console\.log/i)).toBeTruthy();
  });

  it('has guard checkbox enabled by default', () => {
    render(<WebTerminal />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('renders clear and run buttons', () => {
    render(<WebTerminal />);
    // Both buttons should be present in the toolbar
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('appends input to history on Enter without guard', () => {
    render(<WebTerminal />);
    // Uncheck the guard checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const input = screen.getByPlaceholderText(/console\.log/i);
    fireEvent.change(input, { target: { value: '1 + 1' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // The input value should appear in the history
    expect(screen.getByText(/1 \+ 1/)).toBeTruthy();
  });
});
