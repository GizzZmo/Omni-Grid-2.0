import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NeuralChat } from '../widgets/NeuralChat';

// Mock the Gemini service
vi.mock('../services/geminiService', () => ({
  getGenAIClient: vi.fn(),
}));

import { getGenAIClient } from '../services/geminiService';

describe('NeuralChat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the initial greeting message', () => {
    render(<NeuralChat />);
    expect(screen.getByText(/neural link established/i)).toBeInTheDocument();
  });

  it('renders the message input and send button', () => {
    render(<NeuralChat />);
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<NeuralChat />);
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    render(<NeuralChat />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'hello' } });
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).not.toBeDisabled();
  });

  it('shows no-API-key message when API client is not available', async () => {
    vi.mocked(getGenAIClient).mockReturnValue(null);
    render(<NeuralChat />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    await waitFor(() => {
      expect(screen.getByText(/no api key detected/i)).toBeInTheDocument();
    });
  });

  it('clears chat when the clear button is clicked', async () => {
    render(<NeuralChat />);
    const clearBtn = screen.getByRole('button', { name: /clear chat history/i });
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect(screen.getByText(/memory wiped/i)).toBeInTheDocument();
    });
  });

  it('sends message with Enter key', async () => {
    vi.mocked(getGenAIClient).mockReturnValue(null);
    render(<NeuralChat />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    await waitFor(() => {
      expect(screen.getByText('test query')).toBeInTheDocument();
    });
  });

  it('does not send message with Shift+Enter', () => {
    render(<NeuralChat />);
    const input = screen.getByPlaceholderText(/type a message/i) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'multiline' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    // Input should still have value (not sent)
    expect(input.value).toBe('multiline');
  });
});
