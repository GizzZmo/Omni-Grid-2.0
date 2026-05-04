/**
 * Example: Counter Widget — Test Suite
 *
 * Demonstrates the recommended testing patterns for Omni-Grid widgets.
 * Use this as a template when writing tests for your own widget.
 *
 * Key patterns shown:
 *   1.  Render test — widget mounts without errors.
 *   2.  Accessible ARIA labels — query buttons by aria-label.
 *   3.  User interaction — fireEvent / userEvent to drive state changes.
 *   4.  Store integration — mocking useAppStore for persistent state slices.
 *   5.  Error / edge cases — widget behaviour when state is null/empty.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterWidget } from './counter';

// ─── 1. Store mock ──────────────────────────────────────────────────────────
// If your widget reads from the Zustand store, mock ONLY the slices it uses.
// Mocking the entire store avoids import side-effects and keeps tests fast.
const mockSetCount = vi.fn();

vi.mock('../../../store', () => ({
  useAppStore: vi.fn(selector =>
    selector({
      // Include every store field your widget accesses.
      // Unrelated slices can be omitted — they are not needed by CounterWidget.
      counterValue: 0,
      setCounterValue: mockSetCount,
    })
  ),
}));

// ─── 2. Test suite ─────────────────────────────────────────────────────────
describe('CounterWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Pattern 1: Render test ───────────────────────────────────────────────
  it('renders without crashing', () => {
    const { container } = render(<CounterWidget />);
    expect(container).toBeTruthy();
  });

  it('displays the initial counter value of 0', () => {
    render(<CounterWidget />);
    // The large numeric display
    expect(screen.getByText('0')).toBeTruthy();
  });

  // ── Pattern 2: ARIA labels ────────────────────────────────────────────────
  it('renders labelled control buttons', () => {
    render(<CounterWidget />);
    expect(screen.getByRole('button', { name: /increment/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /decrement/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /reset/i })).toBeTruthy();
  });

  // ── Pattern 3: User interaction ───────────────────────────────────────────
  it('increments the counter when the + button is clicked', () => {
    render(<CounterWidget />);
    const incrementBtn = screen.getByRole('button', { name: /increment/i });

    fireEvent.click(incrementBtn);
    expect(screen.getByText('1')).toBeTruthy();

    fireEvent.click(incrementBtn);
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('decrements the counter when the − button is clicked', () => {
    render(<CounterWidget />);
    const decrementBtn = screen.getByRole('button', { name: /decrement/i });
    const incrementBtn = screen.getByRole('button', { name: /increment/i });

    fireEvent.click(incrementBtn); // count = 1
    fireEvent.click(decrementBtn); // count = 0
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('supports negative counts via the − button', () => {
    render(<CounterWidget />);
    fireEvent.click(screen.getByRole('button', { name: /decrement/i }));
    expect(screen.getByText('-1')).toBeTruthy();
  });

  it('resets the counter to 0 when the reset button is clicked', () => {
    render(<CounterWidget />);
    const incrementBtn = screen.getByRole('button', { name: /increment/i });

    fireEvent.click(incrementBtn);
    fireEvent.click(incrementBtn);
    expect(screen.getByText('2')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText('0')).toBeTruthy();
  });

  // ── Pattern 4: Store integration ─────────────────────────────────────────
  // NOTE: CounterWidget uses local state in this example, not the store.
  // The block below shows the pattern to follow when a widget DOES use
  // the store — replace CounterWidget with your widget name and adapt.
  it('(example) calls a store action when store-backed state is mutated', () => {
    // If your widget calls `setMyData(value)` from the store, verify it:
    //   render(<MyWidget />);
    //   fireEvent.click(screen.getByRole('button', { name: /save/i }));
    //   expect(mockSetMyData).toHaveBeenCalledWith('expected-value');
    //
    // For CounterWidget the store mock is not exercised, so we just pass:
    expect(mockSetCount).not.toHaveBeenCalled();
  });

  // ── Pattern 5: Loading / error states ────────────────────────────────────
  // Widgets that fetch data should test loading and error branches too.
  // Example (adapt to your widget):
  //
  // it('shows a loading spinner while fetching', () => {
  //   render(<MyWidget />);
  //   expect(screen.getByRole('status')).toBeTruthy(); // spinner with role="status"
  // });
  //
  // it('shows an error message when the API call fails', () => {
  //   // Override the mock to return an error state for this test only:
  //   (useAppStore as Mock).mockImplementation(sel =>
  //     sel({ myData: null, myError: 'Network error' })
  //   );
  //   render(<MyWidget />);
  //   expect(screen.getByText(/network error/i)).toBeTruthy();
  // });
});
