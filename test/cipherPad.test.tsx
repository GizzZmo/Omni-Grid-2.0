import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CipherPad } from '../widgets/CipherPad';

describe('CipherPad', () => {
  it('renders in locked state by default', () => {
    render(<CipherPad />);
    expect(screen.getByPlaceholderText(/Session Encryption Key/i)).toBeTruthy();
    expect(screen.getByText('UNLOCK')).toBeTruthy();
  });

  it('shows "No content" message when locked with no vault', () => {
    render(<CipherPad />);
    expect(screen.getByText(/No content — unlock to write/i)).toBeTruthy();
  });

  it('UNLOCK button is disabled when key input is empty', () => {
    render(<CipherPad />);
    const button = screen.getByText('UNLOCK');
    expect(button).toBeDisabled();
  });

  it('UNLOCK button becomes enabled when a key is entered', () => {
    render(<CipherPad />);
    const keyInput = screen.getByPlaceholderText(/Session Encryption Key/i);
    fireEvent.change(keyInput, { target: { value: 'secret' } });
    const button = screen.getByText('UNLOCK');
    expect(button).not.toBeDisabled();
  });

  it('unlocks (no vault content) and shows textarea when UNLOCK is clicked', async () => {
    render(<CipherPad />);
    const keyInput = screen.getByPlaceholderText(/Session Encryption Key/i);
    fireEvent.change(keyInput, { target: { value: 'mypassword' } });
    fireEvent.click(screen.getByText('UNLOCK'));

    // Since vault is empty, it should open without decryption
    await vi.waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Type sensitive notes here/i)
      ).toBeTruthy();
    });
  });

  it('shows LOCK button once unlocked', async () => {
    render(<CipherPad />);
    const keyInput = screen.getByPlaceholderText(/Session Encryption Key/i);
    fireEvent.change(keyInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('UNLOCK'));

    await vi.waitFor(() => {
      expect(screen.getByText('LOCK')).toBeTruthy();
    });
  });

  it('clears error when key input changes', async () => {
    render(<CipherPad />);
    const keyInput = screen.getByPlaceholderText(/Session Encryption Key/i);
    fireEvent.change(keyInput, { target: { value: 'k' } });
    // Change key again to trigger error clear
    fireEvent.change(keyInput, { target: { value: 'k2' } });
    // No error should be visible
    expect(screen.queryByText(/Wrong key/i)).toBeNull();
  });
});
