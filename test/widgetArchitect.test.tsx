import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetArchitect } from '../widgets/WidgetArchitect';

vi.mock('../store', () => ({
  useAppStore: vi.fn(() => ({
    addLog: vi.fn(),
    theme: {
      name: 'Test',
      colors: { background: '#000', surface: '#111', primary: '#0ff', secondary: '#f0f', text: '#fff', accent: '#0f0' },
      font: 'monospace',
      radius: '0px',
    },
  })),
}));

vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(() => null),
}));

describe('WidgetArchitect', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<WidgetArchitect />);
    expect(container).toBeTruthy();
  });

  it('renders the BLUEPRINT, CODE, and GRAPH tabs', () => {
    render(<WidgetArchitect />);
    expect(screen.getByText('BLUEPRINT')).toBeTruthy();
    expect(screen.getByText('CODE')).toBeTruthy();
    expect(screen.getByText('GRAPH')).toBeTruthy();
  });

  it('shows BLUEPRINT content by default with a prompt input', () => {
    render(<WidgetArchitect />);
    const textarea = screen.getByPlaceholderText(/describe your widget/i);
    expect(textarea).toBeTruthy();
  });

  it('shows Generate Prototype button', () => {
    render(<WidgetArchitect />);
    expect(screen.getByText(/Generate Prototype/i)).toBeTruthy();
  });

  it('switches to CODE tab when clicked', () => {
    render(<WidgetArchitect />);
    fireEvent.click(screen.getByText('CODE'));
    // CODE tab should render a code display area
    const codeArea = document.querySelector('.font-mono');
    expect(codeArea).toBeTruthy();
  });

  it('switches to GRAPH tab when clicked', () => {
    render(<WidgetArchitect />);
    fireEvent.click(screen.getByText('GRAPH'));
    // GRAPH tab shows "No Blueprint Generated" by default
    expect(screen.getByText(/No Blueprint Generated/i)).toBeTruthy();
  });

  it('shows no-AI message when generate is clicked without API key', async () => {
    render(<WidgetArchitect />);
    const textarea = screen.getByPlaceholderText(/describe your widget/i);
    fireEvent.change(textarea, { target: { value: 'a weather tracker widget' } });

    fireEvent.click(screen.getByText(/Generate Prototype/i));

    // Click the CODE tab to see the generated code
    await vi.waitFor(() => {
      fireEvent.click(screen.getByText('CODE'));
      const codeTextarea = document.querySelector('textarea[readonly]') as HTMLTextAreaElement;
      expect(codeTextarea?.value).toContain('AI Architect unavailable');
    });
  });
});
