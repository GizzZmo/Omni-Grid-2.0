import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChromaLab } from '../widgets/ChromaLab';

describe('ChromaLab', () => {
  it('renders the color picker and shade swatches', () => {
    render(<ChromaLab />);
    // Should show 10 shade levels (50 through 900)
    expect(screen.getByText('50')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('900')).toBeTruthy();
  });

  it('displays HSL and RGB values', () => {
    render(<ChromaLab />);
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/HSL\(/);
    expect(text).toMatch(/RGB\(/);
  });

  it('shows hex values for each shade', () => {
    render(<ChromaLab />);
    // Hex values should be rendered as text in swatches
    const hexPattern = /#[0-9A-F]{6}/i;
    const text = document.body.textContent ?? '';
    expect(hexPattern.test(text)).toBe(true);
  });

  it('renders the clipboard hint footer', () => {
    render(<ChromaLab />);
    expect(screen.getByText(/Click any swatch to copy hex/i)).toBeTruthy();
  });
});
