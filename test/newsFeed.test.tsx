import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsFeed } from '../widgets/NewsFeed';

// Mock the store
vi.mock('../store', () => ({
  useAppStore: () => ({ rssFeeds: ['https://news.ycombinator.com/rss'] }),
}));

describe('NewsFeed', () => {
  it('renders the RSS Stream header', () => {
    render(<NewsFeed />);
    expect(screen.getByText(/RSS Stream/i)).toBeTruthy();
  });

  it('renders mock news items', () => {
    render(<NewsFeed />);
    expect(screen.getByText(/The Future of Local-First Software/i)).toBeTruthy();
    expect(screen.getByText(/React 19 features revealed/i)).toBeTruthy();
  });

  it('shows the number of monitored sources', () => {
    render(<NewsFeed />);
    expect(screen.getByText(/Monitoring/i)).toBeTruthy();
    expect(screen.getByText(/1 Sources/i)).toBeTruthy();
  });

  it('has a refresh button', () => {
    render(<NewsFeed />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows source attribution for news items', () => {
    render(<NewsFeed />);
    expect(screen.getByText('Hacker News')).toBeTruthy();
    expect(screen.getByText('TechCrunch')).toBeTruthy();
  });
});
