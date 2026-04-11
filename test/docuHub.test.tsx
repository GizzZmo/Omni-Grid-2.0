import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocuHub } from '../widgets/DocuHub';

describe('DocuHub', () => {
  it('renders the Local Documentation header', () => {
    render(<DocuHub />);
    expect(screen.getByText(/Local Documentation/i)).toBeTruthy();
  });

  it('renders the devdocs languages', () => {
    render(<DocuHub />);
    expect(screen.getByText(/DevDocs languages/i)).toBeTruthy();
  });

  it('renders an Open Source link', () => {
    render(<DocuHub />);
    expect(screen.getByText(/Open Source/i)).toBeTruthy();
  });

  it('renders the iframe pointing to devdocs.io', () => {
    render(<DocuHub />);
    const iframe = document.querySelector('iframe[title="DevDocs"]');
    expect(iframe).toBeTruthy();
    expect((iframe as Element & { src: string })?.src).toContain('devdocs.io');
  });

  it('renders the powered-by footer', () => {
    render(<DocuHub />);
    expect(screen.getByText(/Powered by DevDocs/i)).toBeTruthy();
  });
});
