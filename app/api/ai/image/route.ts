import { json, readJson, requireEnv } from '@/lib/server';

type Body={prompt:string};
export async function POST(request:Request){
 try{
  const {prompt}=await readJson<Body>(request); if(!prompt?.trim()) return json({error:'Image prompt is required'},400);
  const key=requireEnv('GEMINI_API_KEY'); const model=process.env.GEMINI_IMAGE_MODEL||'gemini-3-pro-image';
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({model,input:prompt,response_format:{type:'image',mime_type:'image/png',aspect_ratio:'4:5',image_size:'1K'}})});
  const data=await r.json(); if(!r.ok) return json({error:data?.error?.message||'Gemini image request failed'},502);
  const img=data?.output_image?.data; const mime=data?.output_image?.mime_type||'image/png';
  if(!img) return json({error:'Gemini returned no image data'},502);
  return json({imageData:img,mimeType:mime});
 }catch(e:any){return json({error:e?.message||'Image generation failed'},500)}
}
