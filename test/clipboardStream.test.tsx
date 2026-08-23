import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClipboardStream } from '../widgets/ClipboardStream';

const mockStore = {
  clipboardHistory: [] as string[],
  addToClipboardHistory: vi.fn(),
  clearClipboardHistory: vi.fn(),
};

vi.mock('../store', () => ({
  useAppStore: () => mockStore,
}));

describe('ClipboardStream', () => {
  it('renders the paste button', () => {
    render(<ClipboardStream />);
    // UI label is "Capture" (reads from system clipboard)
    expect(screen.getByText(/Capture/i)).toBeTruthy();
  });

  it('shows empty buffer message when history is empty', () => {
    render(<ClipboardStream />);
    expect(screen.getByText(/No history yet/i)).toBeTruthy();
  });

  it('renders clipboard items when history is not empty', () => {
    mockStore.clipboardHistory = ['Hello World', 'Second item'];
    render(<ClipboardStream />);
    expect(screen.getByText('Hello World')).toBeTruthy();
    expect(screen.getByText('Second item')).toBeTruthy();
    mockStore.clipboardHistory = [];
  });

  it('shows clear button when history is not empty', () => {
    mockStore.clipboardHistory = ['Some text'];
    render(<ClipboardStream />);
    expect(screen.getByText(/Clear Buffer/i)).toBeTruthy();
    mockStore.clipboardHistory = [];
  });

  it('calls clearClipboardHistory when clear button is clicked', () => {
    mockStore.clipboardHistory = ['Some text'];
    mockStore.clearClipboardHistory.mockClear();
    render(<ClipboardStream />);
    fireEvent.click(screen.getByText(/Clear Buffer/i));
    expect(mockStore.clearClipboardHistory).toHaveBeenCalled();
    mockStore.clipboardHistory = [];
  });
});
