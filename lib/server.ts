export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured on the server`);
  return value;
}

export async function readJson<T>(request: Request): Promise<T> {
  try { return await request.json() as T; } catch { throw new Error('Invalid JSON request'); }
}
