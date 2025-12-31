import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executePythonInSandbox } from '../services/e2bSandbox';

const ORIGINAL_API_KEY = process.env.E2B_API_KEY;

describe('executePythonInSandbox', () => {
  beforeEach(() => {
    process.env.E2B_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env.E2B_API_KEY = ORIGINAL_API_KEY;
  });

  it('creates a sandbox, executes python, and tears it down', async () => {
    const calls: Array<{ url: string; options: any }> = [];

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async (url: string, options: any) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ id: 'sbx-1' }) };
      })
      .mockImplementationOnce(async (url: string, options: any) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ output: 'hello' }) };
      })
      .mockImplementationOnce(async (url: string, options: any) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({}) };
      });

    const result = await executePythonInSandbox('print("hello")', fetchMock as any);

    expect(result.output).toBe('hello');
    expect(calls.map(call => `${call.options?.method} ${call.url}`)).toEqual([
      'POST https://api.e2b.dev/v1/sandboxes',
      'POST https://api.e2b.dev/v1/sandboxes/sbx-1/execute',
      'DELETE https://api.e2b.dev/v1/sandboxes/sbx-1',
    ]);

    const execBody = JSON.parse(calls[1].options.body);
    expect(execBody.language).toBe('python');
    expect(execBody.code).toContain('hello');
  });

  it('still tears down the sandbox when execution fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'sbx-err' }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await expect(executePythonInSandbox('print("fail")', fetchMock as any)).rejects.toThrow(
      'Sandbox execution failed.'
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://api.e2b.dev/v1/sandboxes/sbx-err',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws when E2B API key is missing', async () => {
    process.env.E2B_API_KEY = '';

    await expect(
      executePythonInSandbox('print("no key")', vi.fn() as any)
    ).rejects.toThrow('Missing E2B_API_KEY');
  });
});
