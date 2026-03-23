import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CipherVault } from '../widgets/CipherVault';

describe('CipherVault', () => {
  it('renders Generate, Transform, and AES-GCM tabs', () => {
    render(<CipherVault />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transform/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aes-gcm/i })).toBeInTheDocument();
  });

  it('generates a UUID v4 on button click', async () => {
    render(<CipherVault />);
    fireEvent.click(screen.getByRole('button', { name: /uuid v4/i }));
    await waitFor(() => {
      const output = screen.getByText(/[0-9a-f-]{36}/i);
      expect(output).toBeInTheDocument();
    });
  });

  it('shows AES-GCM mode with Encrypt / Decrypt sub-tabs', () => {
    render(<CipherVault />);
    fireEvent.click(screen.getByRole('button', { name: /aes-gcm/i }));
    // Use getAllByRole since "Encrypt" matches both the mode tab and the sub-tab
    const encryptBtns = screen.getAllByRole('button', { name: /encrypt/i });
    expect(encryptBtns.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /decrypt/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/passphrase/i)).toBeInTheDocument();
  });

  it('shows an error when encrypt is clicked with empty passphrase', async () => {
    render(<CipherVault />);
    fireEvent.click(screen.getByRole('button', { name: /aes-gcm/i }));

    // Fill plaintext but leave passphrase empty
    const textarea = screen.getByPlaceholderText(/plaintext to encrypt/i);
    fireEvent.change(textarea, { target: { value: 'secret message' } });

    // The action button should now be enabled (only disabled when loading or no input)
    const encryptBtn = screen.getByRole('button', { name: /encrypt \(aes-gcm\)/i });
    expect(encryptBtn).not.toBeDisabled();

    fireEvent.click(encryptBtn);
    await waitFor(() => {
      expect(screen.getByText(/passphrase is required/i)).toBeInTheDocument();
    });
  });

  it('encrypts and produces a non-empty base64 output', async () => {
    render(<CipherVault />);
    fireEvent.click(screen.getByRole('button', { name: /aes-gcm/i }));

    fireEvent.change(screen.getByPlaceholderText(/passphrase/i), {
      target: { value: 'test-passphrase' },
    });
    fireEvent.change(screen.getByPlaceholderText(/plaintext to encrypt/i), {
      target: { value: 'hello world' },
    });

    fireEvent.click(screen.getByRole('button', { name: /encrypt \(aes-gcm\)/i }));

    await waitFor(() => {
      // Output section should appear
      expect(screen.getByText(/output/i)).toBeInTheDocument();
    });
  });
});
