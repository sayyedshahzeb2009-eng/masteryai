import { json, readJson, requireEnv } from '@/lib/server';

type Body={text:string;voiceId?:string};
export async function POST(request:Request){
 try{
  const {text,voiceId=process.env.ELEVENLABS_VOICE_ID||'JBFqnCBsd6RMkjVDRZzb'}=await readJson<Body>(request);
  if(!text?.trim()) return json({error:'Text is required'},400);
  const key=requireEnv('ELEVENLABS_API_KEY'); const model=process.env.ELEVENLABS_MODEL||'eleven_multilingual_v2';
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':key,'content-type':'application/json'},body:JSON.stringify({text,model_id:model})});
  if(!r.ok){const t=await r.text();return json({error:t||`ElevenLabs returned ${r.status}`},502)}
  const bytes=new Uint8Array(await r.arrayBuffer()); let binary=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
  return json({audioUrl:`data:audio/mpeg;base64,${btoa(binary)}`});
 }catch(e:any){return json({error:e?.message||'Voice generation failed'},500)}
}
