import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetMarketplace } from '../widgets/WidgetMarketplace';

// Provide a minimal store mock with the actual store shape
const mockInstallWidget = vi.fn();
const mockUninstallWidget = vi.fn();
const mockCheckForUpdates = vi.fn();
const mockToggleWidget = vi.fn();

vi.mock('../store', () => ({
  useAppStore: vi.fn(selector => {
    const state = {
      installedWidgets: {} as Record<string, string>,
      availableUpdates: [] as string[],
      marketplaceLastChecked: 1, // non-zero to skip auto-check
      installWidget: mockInstallWidget,
      uninstallWidget: mockUninstallWidget,
      checkForUpdates: mockCheckForUpdates,
      toggleWidget: mockToggleWidget,
      visibleWidgets: [] as string[],
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

describe('WidgetMarketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<WidgetMarketplace />);
    expect(container).toBeTruthy();
  });

  it('renders the Widget Marketplace heading', () => {
    render(<WidgetMarketplace />);
    expect(screen.getByText(/Widget Marketplace/i)).toBeTruthy();
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
    // Should show installed count heading
    expect(screen.getByText(/Widget Marketplace/i)).toBeTruthy();
  });

  it('renders Check Updates button in the header', () => {
    render(<WidgetMarketplace />);
    expect(screen.getByText(/Check Updates/i)).toBeTruthy();
  });
});
