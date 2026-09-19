import crypto from 'node:crypto';

const secret = () => process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || '';

export function requireSecret() { if (!secret()) throw new Error('APP_SECRET is not configured'); }

export function signState(payload: string) {
  requireSecret();
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyState(value: string) {
  requireSecret();
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { provider: string; state: string; exp: number };
  if (data.exp < Date.now()) return null;
  return data;
}

export function makeOAuthState(provider: string) {
  const data = Buffer.from(JSON.stringify({ provider, state: crypto.randomUUID(), exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  return signState(data);
}
