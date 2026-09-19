import { json } from '@/lib/server';
import { dbQuery, hasDatabase } from '@/lib/db';

export async function GET() {
  const keys = ['ANTHROPIC_API_KEY','GEMINI_API_KEY','ELEVENLABS_API_KEY','INSTAGRAM_APP_ID','INSTAGRAM_APP_SECRET','YOUTUBE_CLIENT_ID','YOUTUBE_CLIENT_SECRET','DATABASE_URL','APP_SECRET','BLOB_READ_WRITE_TOKEN'];
  let database = 'not configured';
  if (hasDatabase()) { try { await dbQuery('select 1'); database = 'connected'; } catch { database = 'error'; } }
  return json({ ok: database !== 'error', service:'MasterYAI', time:new Date().toISOString(), database, env:keys.filter(k=>Boolean(process.env[k])) });
}
