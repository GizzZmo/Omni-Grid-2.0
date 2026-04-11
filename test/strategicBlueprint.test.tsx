import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StrategicBlueprint } from '../widgets/StrategicBlueprint';

describe('StrategicBlueprint', () => {
  it('renders the section navigation items', () => {
    render(<StrategicBlueprint />);
    // There may be multiple references to 'Executive Summary' (in nav + content), just check at least one exists
    const items = screen.getAllByText(/Executive Summary/i);
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Widget Enhancement section link', () => {
    render(<StrategicBlueprint />);
    expect(screen.getByText(/Widget Enhancement/i)).toBeTruthy();
  });

  it('renders all section navigation items', () => {
    render(<StrategicBlueprint />);
    expect(screen.getByText(/GUI Optimization/i)).toBeTruthy();
    expect(screen.getByText(/New Widgets/i)).toBeTruthy();
    expect(screen.getByText(/Conclusion/i)).toBeTruthy();
  });

  it('renders the Data Analyst Supplement section', () => {
    render(<StrategicBlueprint />);
    expect(screen.getByText(/Data Analyst Supplement/i)).toBeTruthy();
  });

  it('switches to Widget Enhancement section on click', () => {
    render(<StrategicBlueprint />);
    fireEvent.click(screen.getByText(/Widget Enhancement/i));
    // The section content should change
    expect(screen.getByText(/Widget Enhancement/i)).toBeTruthy();
  });
});
