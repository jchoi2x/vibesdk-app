import { describe, it, expect } from 'vitest';
import worker from './index';

describe('rate-limit worker', () => {
  it('returns 404 for unknown route', async () => {
    const request = new Request('https://example.com/unknown');
    const response = await worker.fetch(request, {} as Env);

    expect(response.status).toBe(404);
  });
});
