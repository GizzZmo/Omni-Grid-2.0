import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GitPulse } from '../widgets/GitPulse';

vi.mock('../store', () => ({
  useAppStore: () => ({
    gitToken: '',
    setGitToken: vi.fn(),
  }),
}));

describe('GitPulse', () => {
  it('renders the token input', () => {
    render(<GitPulse />);
    expect(screen.getByPlaceholderText(/Personal Access Token/i)).toBeTruthy();
  });

  it('shows demo data notice when no token is set', () => {
    render(<GitPulse />);
    expect(screen.getByText(/Showing demo data/i)).toBeTruthy();
  });

  it('renders mock pull requests', () => {
    render(<GitPulse />);
    expect(screen.getByText(/add dark mode support/i)).toBeTruthy();
    expect(screen.getByText(/memory leak in grid/i)).toBeTruthy();
  });

  it('renders PR status counts', () => {
    render(<GitPulse />);
    expect(screen.getByText(/Open:/i)).toBeTruthy();
    expect(screen.getByText(/Merged:/i)).toBeTruthy();
  });

  it('renders the refresh button', () => {
    render(<GitPulse />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
