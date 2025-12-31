const E2B_API_BASE = 'https://api.e2b.dev/v1';

export interface SandboxExecutionResult {
  output: string;
  error?: string;
}

export const executePythonInSandbox = async (
  code: string,
  fetchImpl: typeof fetch = fetch
): Promise<SandboxExecutionResult> => {
  if (!code.trim()) {
    throw new Error('No code provided for sandbox execution.');
  }

  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) {
    throw new Error('Missing E2B_API_KEY for sandbox execution.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const createRes = await fetchImpl(`${E2B_API_BASE}/sandboxes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ runtime: 'python' }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to initialize sandbox.');
  }

  const createJson = (await createRes.json()) as { id?: string };
  if (!createJson.id) {
    throw new Error('Sandbox ID missing from response.');
  }

  const sandboxId = createJson.id;

  try {
    const execRes = await fetchImpl(`${E2B_API_BASE}/sandboxes/${sandboxId}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ language: 'python', code }),
    });

    if (!execRes.ok) {
      throw new Error('Sandbox execution failed.');
    }

    const execJson = (await execRes.json()) as {
      output?: string;
      error?: string;
      stderr?: string;
    };

    return {
      output: execJson.output ?? '',
      error: execJson.error ?? execJson.stderr,
    };
  } finally {
    await fetchImpl(`${E2B_API_BASE}/sandboxes/${sandboxId}`, {
      method: 'DELETE',
      headers,
    }).catch(() => undefined);
  }
};
