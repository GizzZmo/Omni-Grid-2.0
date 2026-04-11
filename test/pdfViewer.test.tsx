import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PDFViewer } from '../widgets/PDFViewer';

describe('PDFViewer', () => {
  it('renders the drop zone with icon and label', () => {
    render(<PDFViewer />);
    expect(screen.getByText(/Drop PDF Whitepaper/i)).toBeTruthy();
  });

  it('renders a file input for PDF files', () => {
    render(<PDFViewer />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe('application/pdf');
  });

  it('does not show the close button initially', () => {
    render(<PDFViewer />);
    expect(screen.queryByText(/Close PDF/i)).toBeNull();
  });

  it('shows drop zone with upload icon when no file loaded', () => {
    render(<PDFViewer />);
    // The dashed border drop zone should be visible
    const dropZone = document.querySelector('.border-dashed');
    expect(dropZone).toBeTruthy();
  });
});
