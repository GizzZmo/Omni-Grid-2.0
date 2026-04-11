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
    expect(screen.getByText(/Paste from System/i)).toBeTruthy();
  });

  it('shows empty buffer message when history is empty', () => {
    render(<ClipboardStream />);
    expect(screen.getByText(/Buffer Empty/i)).toBeTruthy();
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
    render(<ClipboardStream />);
    const clearBtn = screen.getByText(/Clear Buffer/i).closest('button')!;
    fireEvent.click(clearBtn);
    expect(mockStore.clearClipboardHistory).toHaveBeenCalled();
    mockStore.clipboardHistory = [];
  });
});
