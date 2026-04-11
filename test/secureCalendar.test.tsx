import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecureCalendar } from '../widgets/SecureCalendar';

vi.mock('../store', () => ({
  useAppStore: () => ({
    calendarEvents: [],
    addCalendarEvent: vi.fn(),
  }),
}));

describe('SecureCalendar', () => {
  it('renders the current month and year', () => {
    render(<SecureCalendar />);
    const now = new Date();
    const monthName = now.toLocaleDateString('default', { month: 'long' });
    expect(screen.getByText(new RegExp(monthName, 'i'))).toBeTruthy();
  });

  it('renders the day-of-week headers', () => {
    render(<SecureCalendar />);
    // The calendar shows S M T W T F S
    const dayHeaders = screen.getAllByText('S');
    expect(dayHeaders.length).toBeGreaterThanOrEqual(2); // Two Sundays/Saturdays
  });

  it('renders navigation arrows', () => {
    render(<SecureCalendar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows the encrypted events notice', () => {
    render(<SecureCalendar />);
    expect(screen.getByText(/End-to-End Encrypted/i)).toBeTruthy();
  });

  it('renders day numbers', () => {
    render(<SecureCalendar />);
    // Day 1 should always be visible
    expect(screen.getByText('1')).toBeTruthy();
  });
});
