import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WritePad } from '../widgets/WritePad';

vi.mock('../store', () => ({
  useAppStore: vi.fn(() => ({
    writePadContent: '',
    setWritePadContent: vi.fn(),
  })),
}));

vi.mock('../services/gridIntelligence', () => ({
  processCrossTalk: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(() => null),
}));

describe('WritePad', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<WritePad />);
    expect(container).toBeTruthy();
  });

  it('renders the main writing textarea', () => {
    render(<WritePad />);
    const textarea = screen.getByPlaceholderText(/start typing/i);
    expect(textarea).toBeTruthy();
  });

  it('renders template selector dropdown', () => {
    render(<WritePad />);
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
  });

  it('default template is Blank', () => {
    render(<WritePad />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('Blank');
  });

  it('applies a template when selected', () => {
    render(<WritePad />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Cover Letter' } });

    const textarea = screen.getByPlaceholderText(/start typing/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Dear [Hiring Manager Name]');
  });

  it('renders toolbar buttons (Open, Save, AI Draft)', () => {
    render(<WritePad />);
    expect(screen.getByRole('button', { name: /Open File/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Save File/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Toggle AI Draft/i })).toBeTruthy();
  });

  it('toggles AI Draft input panel when AI Draft button is clicked', () => {
    render(<WritePad />);
    const aiDraftBtn = screen.getByRole('button', { name: /Toggle AI Draft/i });

    // Initially hidden
    expect(screen.queryByRole('button', { name: /Generate Draft/i })).toBeNull();

    fireEvent.click(aiDraftBtn);

    // Should now be visible
    expect(screen.getByRole('button', { name: /Generate Draft/i })).toBeTruthy();
  });

  it('updates textarea content on typing', () => {
    render(<WritePad />);
    const textarea = screen.getByPlaceholderText(/start typing/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(textarea.value).toBe('Hello world');
  });

  it('clears the document when Clear button is clicked', () => {
    render(<WritePad />);
    const textarea = screen.getByPlaceholderText(/start typing/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Some content' } });

    fireEvent.click(screen.getByRole('button', { name: /Clear Document/i }));
    expect(textarea.value).toBe('');
  });
});
