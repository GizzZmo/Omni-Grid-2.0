import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadJson, uploadJson } from '../utils';

describe('Utils', () => {
  describe('downloadJson', () => {
    it('should be a function', () => {
      expect(typeof downloadJson).toBe('function');
    });

    it('creates a blob with JSON content and triggers download', () => {
      const revokeObjectURL = vi.fn();
      const click = vi.fn();
      const appendChild = vi.fn();
      const removeChild = vi.fn();
      const createObjectURL = vi.fn(() => 'blob:http://localhost/test-url');

      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const mockAnchor = { href: '', download: '', click, style: {} } as any;
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') return mockAnchor;
        return document.createElement(tag);
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(appendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(removeChild);

      const data = { name: 'test', value: 42 };
      downloadJson('test.json', data);

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(mockAnchor.download).toBe('test.json');
      expect(click).toHaveBeenCalledOnce();
      expect(appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(removeChild).toHaveBeenCalledWith(mockAnchor);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-url');

      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('serializes data as formatted JSON in the blob', () => {
      let capturedBlob: Blob | null = null;
      const revokeObjectURL = vi.fn();
      const createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:http://localhost/test';
      });

      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
        style: {},
      } as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      downloadJson('data.json', { foo: 'bar' });

      expect(capturedBlob).not.toBeNull();
      expect(capturedBlob!.type).toBe('application/json');

      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });
  });

  describe('uploadJson', () => {
    it('should be a function', () => {
      expect(typeof uploadJson).toBe('function');
    });

    it('creates a file input and clicks it', () => {
      const click = vi.fn();
      const mockInput = {
        type: '',
        accept: '',
        onchange: null as any,
        click,
        files: null,
      };

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'input') return mockInput as any;
        return document.createElement(tag);
      });

      const cb = vi.fn();
      uploadJson(cb);

      expect(mockInput.type).toBe('file');
      expect(mockInput.accept).toBe('.json');
      expect(click).toHaveBeenCalledOnce();

      vi.restoreAllMocks();
    });

    it('calls the callback with parsed JSON on valid file', async () => {
      const parsedData = { key: 'value' };
      const jsonString = JSON.stringify(parsedData);
      const mockInput: any = { type: '', accept: '', onchange: null, click: vi.fn() };

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'input') return mockInput;
        return document.createElement(tag);
      });

      const callback = vi.fn();
      uploadJson(callback);

      // Simulate file selection
      const mockFile = new File([jsonString], 'test.json', { type: 'application/json' });
      const mockEvent = { target: { files: [mockFile] } } as any;

      // Create a mock FileReader class
      class MockFileReader {
        onload: ((e: any) => void) | null = null;
        readAsText(_f: File) {
          Promise.resolve().then(() => {
            if (this.onload) {
              this.onload({ target: { result: jsonString } });
            }
          });
        }
      }

      const OriginalFileReader = window.FileReader;
      (window as any).FileReader = MockFileReader;

      mockInput.onchange(mockEvent);

      await new Promise(r => setTimeout(r, 20));

      expect(callback).toHaveBeenCalledWith(parsedData);

      (window as any).FileReader = OriginalFileReader;
      vi.restoreAllMocks();
    });

    it('shows an alert and does not call callback on invalid JSON', async () => {
      const mockInput: any = { type: '', accept: '', onchange: null, click: vi.fn() };

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'input') return mockInput;
        return document.createElement(tag);
      });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn();

      uploadJson(callback);

      const mockFile = new File(['invalid json {{{'], 'bad.json', { type: 'application/json' });
      const mockEvent = { target: { files: [mockFile] } } as any;

      class MockFileReader {
        onload: ((e: any) => void) | null = null;
        readAsText(_f: File) {
          Promise.resolve().then(() => {
            if (this.onload) {
              this.onload({ target: { result: 'invalid json {{{' } });
            }
          });
        }
      }

      const OriginalFileReader = window.FileReader;
      (window as any).FileReader = MockFileReader;

      mockInput.onchange(mockEvent);

      await new Promise(r => setTimeout(r, 20));

      expect(callback).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Invalid JSON file');

      (window as any).FileReader = OriginalFileReader;
      vi.restoreAllMocks();
    });

    it('does nothing when no file is selected', () => {
      const mockInput: any = { type: '', accept: '', onchange: null, click: vi.fn() };

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'input') return mockInput;
        return document.createElement(tag);
      });

      const callback = vi.fn();
      uploadJson(callback);

      // No files selected
      const mockEvent = { target: { files: [] } } as any;
      mockInput.onchange(mockEvent);

      expect(callback).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
