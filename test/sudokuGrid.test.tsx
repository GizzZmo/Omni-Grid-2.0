import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SudokuGrid } from '../widgets/SudokuGrid';

describe('SudokuGrid', () => {
  it('renders without crashing', () => {
    const { container } = render(<SudokuGrid />);
    expect(container).toBeTruthy();
  });

  it('renders the difficulty selector with Easy/Medium/Hard options', () => {
    render(<SudokuGrid />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain('EASY');
    expect(options).toContain('MEDIUM');
    expect(options).toContain('HARD');
  });

  it('renders a Restart / new game button', () => {
    render(<SudokuGrid />);
    // The restart button has title="Restart"
    const restartBtn = document.querySelector('[title="Restart"]');
    expect(restartBtn).toBeTruthy();
  });

  it('renders a 9x9 grid (81 cells)', () => {
    render(<SudokuGrid />);
    // The grid has grid-cols-9 class
    const grid = document.querySelector('.grid-cols-9');
    expect(grid).toBeTruthy();
    expect(grid!.children.length).toBe(81);
  });

  it('shows mistakes counter', () => {
    render(<SudokuGrid />);
    // The mistakes counter shows "0/3" initially
    expect(screen.getByText('0/3')).toBeTruthy();
  });

  it('renders a pause button', () => {
    render(<SudokuGrid />);
    // Pause / play button
    const pauseBtn = screen.getAllByRole('button').find(
      b => b.querySelector('svg') !== null && !b.getAttribute('title')
    );
    expect(pauseBtn).toBeTruthy();
  });

  it('changes difficulty when selector is changed', () => {
    render(<SudokuGrid />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'HARD' } });
    expect(select.value).toBe('HARD');
  });
});
