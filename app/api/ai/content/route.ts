import { json, readJson, requireEnv } from '@/lib/server';

type Body={topic:string;language?:string;platform?:string};
export async function POST(request:Request){
 try{
  const {topic,language='Hindi + Hinglish',platform='Instagram'}=await readJson<Body>(request);
  if(!topic?.trim()) return json({error:'Topic is required'},400);
  const key=requireEnv('ANTHROPIC_API_KEY');
  const model=process.env.ANTHROPIC_MODEL||'claude-sonnet-4-6';
  const prompt=`Create an original ${platform} entertainment-news content package about: ${topic}. Language: ${language}. Do not invent facts. Clearly separate confirmed reporting from unverified claims. Return ONLY valid JSON with keys: headline, caption, script, hashtags (array of strings), imagePrompt, seoKeywords (array of strings). Keep the caption concise and suitable for social media.`;
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:1400,messages:[{role:'user',content:prompt}]})});
  const data=await r.json(); if(!r.ok) return json({error:data?.error?.message||'Claude request failed'},502);
  const text=(data?.content||[]).filter((x:any)=>x.type==='text').map((x:any)=>x.text).join('\n').replace(/^```json\s*/,'').replace(/```$/,'').trim();
  try{return json({content:JSON.parse(text)})}catch{return json({content:{headline:'AI result',caption:text,script:text,hashtags:[],imagePrompt:`Create a premium news poster about ${topic}`,seoKeywords:[topic]}})}
 }catch(e:any){return json({error:e?.message||'AI content generation failed'},500)}
}
