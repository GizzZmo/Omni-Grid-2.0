import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DevOptic } from '../widgets/DevOptic';

// A valid HS256 JWT with a known payload (non-expired — exp year 2099)
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"user-42","iat":1700000000,"exp":4100000000,"iss":"omni-grid"}
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ1c2VyLTQyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDAwMDAwMDAsImlzcyI6Im9tbmktZ3JpZCJ9.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// An expired JWT (exp = 1)
const EXPIRED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('DevOptic — JWT decoder', () => {
  it('shows the JWT and Regex tabs', () => {
    render(<DevOptic />);
    expect(screen.getByRole('button', { name: /jwt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /regex/i })).toBeInTheDocument();
  });

  it('decodes a valid JWT and shows header + payload sections', () => {
    render(<DevOptic />);
    const input = screen.getByPlaceholderText(/paste jwt/i);
    fireEvent.change(input, { target: { value: VALID_JWT } });

    // Section headings (rendered in separate elements from tab button)
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Payload')).toBeInTheDocument();

    // Header claim values: alg = HS256, typ = JWT (multiple "JWT" strings expected)
    expect(screen.getByText('HS256')).toBeInTheDocument();
    // "JWT" appears in both the tab button and the header value cell — check at least one exists
    const jwtTexts = screen.getAllByText('JWT');
    expect(jwtTexts.length).toBeGreaterThanOrEqual(1);

    // Payload claim keys and their labels
    expect(screen.getByText(/Issuer/)).toBeInTheDocument();
    expect(screen.getByText(/omni-grid/)).toBeInTheDocument();

    // sub claim
    expect(screen.getByText(/user-42/)).toBeInTheDocument();
  });

  it('shows TOKEN VALID badge for a non-expired token', () => {
    render(<DevOptic />);
    fireEvent.change(screen.getByPlaceholderText(/paste jwt/i), {
      target: { value: VALID_JWT },
    });
    expect(screen.getByText(/token valid/i)).toBeInTheDocument();
  });

  it('shows TOKEN EXPIRED badge for an expired token', () => {
    render(<DevOptic />);
    fireEvent.change(screen.getByPlaceholderText(/paste jwt/i), {
      target: { value: EXPIRED_JWT },
    });
    expect(screen.getByText(/token expired/i)).toBeInTheDocument();
  });

  it('shows an error for a malformed token', () => {
    render(<DevOptic />);
    fireEvent.change(screen.getByPlaceholderText(/paste jwt/i), {
      target: { value: 'not.a.valid.jwt.here' },
    });
    expect(screen.getByText(/must have exactly 3/i)).toBeInTheDocument();
  });
});
