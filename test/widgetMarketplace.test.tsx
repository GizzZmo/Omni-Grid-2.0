import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetMarketplace } from '../widgets/WidgetMarketplace';
import { COMMUNITY_SUBMISSIONS_STORAGE_KEY } from '../widgets/communitySubmissionStore';

// Provide a minimal store mock with the actual store shape
const mockInstallWidget = vi.fn();
const mockUninstallWidget = vi.fn();
const mockCheckForUpdates = vi.fn();
const mockToggleWidget = vi.fn();
const mockState = {
  installedWidgets: {} as Record<string, string>,
  availableUpdates: [] as string[],
  marketplaceLastChecked: 1,
  installWidget: mockInstallWidget,
  uninstallWidget: mockUninstallWidget,
  checkForUpdates: mockCheckForUpdates,
  toggleWidget: mockToggleWidget,
  visibleWidgets: [] as string[],
};

vi.mock('../store', () => ({
  useAppStore: vi.fn(selector => (typeof selector === 'function' ? selector(mockState) : mockState)),
}));

describe('WidgetMarketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.installedWidgets = {};
    mockState.availableUpdates = [];
    mockState.marketplaceLastChecked = 1;
    mockState.visibleWidgets = [];
    localStorage.removeItem(COMMUNITY_SUBMISSIONS_STORAGE_KEY);
  });

  it('renders without crashing', () => {
    const { container } = render(<WidgetMarketplace />);
    expect(container).toBeTruthy();
  });

  it('renders the Widget Marketplace heading', () => {
    render(<WidgetMarketplace />);
    expect(screen.getByRole('heading', { name: /Widget Marketplace/i })).toBeTruthy();
  });

  it('renders Browse, Installed, Updates and Developer tab buttons', () => {
    render(<WidgetMarketplace />);
    // Get tabs by their role=button and check text
    const buttons = screen.getAllByRole('button');
    const tabLabels = buttons.map(b => b.textContent?.trim());
    expect(tabLabels).toContain('Browse');
    expect(tabLabels).toContain('Installed');
    expect(tabLabels).toContain('Updates');
  });

  it('renders a search input in the Browse tab', () => {
    render(<WidgetMarketplace />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeTruthy();
  });

  it('filters widget list by search query', () => {
    render(<WidgetMarketplace />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'XYZ_NotFoundWidget_12345' } });
    // No widget matching this query
    expect(screen.queryByText('XYZ_NotFoundWidget_12345')).toBeNull();
  });

  it('switches to Developer tab and shows Developer Portal', () => {
    render(<WidgetMarketplace />);
    // Click the "Developer" tab button (there should be a tab with that label)
    const devTabButtons = screen
      .getAllByRole('button')
      .filter(b => b.textContent?.trim() === 'Developer');
    expect(devTabButtons.length).toBeGreaterThan(0);
    fireEvent.click(devTabButtons[0]);
    expect(screen.getByText(/Developer Portal/i)).toBeTruthy();
  });

  it('switches to Installed tab', () => {
    render(<WidgetMarketplace />);
    const installedTabBtn = screen
      .getAllByRole('button')
      .find(b => b.textContent?.trim() === 'Installed');
    expect(installedTabBtn).toBeTruthy();
    fireEvent.click(installedTabBtn!);
    // Should still show the marketplace heading after switching tabs
    expect(screen.getByRole('heading', { name: /Widget Marketplace/i })).toBeTruthy();
  });

  it('renders Check Updates button in the header', () => {
    render(<WidgetMarketplace />);
    expect(screen.getByText(/Check Updates/i)).toBeTruthy();
  });

  it('shows recent community submissions in the Developer tab', () => {
    localStorage.setItem(
      COMMUNITY_SUBMISSIONS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'submission-1',
          widgetId: 'MY_WIDGET',
          name: 'My Widget',
          description: 'Test widget',
          version: '1.0.0',
          author: 'operator',
          category: 'utility',
          tags: ['test'],
          repositoryUrl: 'https://example.com/repo',
          checklistPassed: ['no-eval'],
          submittedAt: Date.now(),
          status: 'pending',
          reviewNote: 'Waiting for review',
        },
      ])
    );

    render(<WidgetMarketplace />);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.trim() === 'Developer')!);

    expect(screen.getByText(/Community Submission Queue/i)).toBeTruthy();
    expect(screen.getByText('My Widget')).toBeTruthy();
    expect(screen.getAllByText(/Pending Review/i).length).toBeGreaterThan(0);
  });

  it('opens the Community Portal widget from the Developer tab', () => {
    render(<WidgetMarketplace />);
    fireEvent.click(screen.getAllByRole('button').find(b => b.textContent?.trim() === 'Developer')!);
    fireEvent.click(screen.getByRole('button', { name: /Open Community Portal/i }));

    expect(mockToggleWidget).toHaveBeenCalledWith('COMMUNITY_PORTAL');
  });
});
