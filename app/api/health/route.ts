import { json } from '@/lib/server';

export async function GET() {
  const keys = ['ANTHROPIC_API_KEY','GEMINI_API_KEY','ELEVENLABS_API_KEY','INSTAGRAM_APP_ID','INSTAGRAM_APP_SECRET','YOUTUBE_CLIENT_ID','YOUTUBE_CLIENT_SECRET'];
  return json({ ok:true, service:'MasterYAI', time:new Date().toISOString(), env:keys.filter(k=>Boolean(process.env[k])) });
}
