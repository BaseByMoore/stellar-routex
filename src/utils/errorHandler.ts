import { Response } from 'express';

/** Extract a readable message from Stellar SDK or generic errors */
export function handleError(res: Response, err: unknown): void {
  if (err instanceof Error) {
    // Stellar horizon errors carry extras.result_codes
    const stellarErr = err as Error & { response?: { data?: { extras?: { result_codes?: unknown } } } };
    const codes = stellarErr.response?.data?.extras?.result_codes;
    const body: Record<string, unknown> = { error: err.message };
    if (codes) body['result_codes'] = codes;
    res.status(400).json(body);
  } else {
    res.status(500).json({ error: 'Unknown error' });
  }
}
