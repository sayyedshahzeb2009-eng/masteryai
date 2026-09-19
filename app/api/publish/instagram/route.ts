import { json, readJson } from '@/lib/server';
import { storeBase64Image } from '@/lib/storage';

type Body={caption:string;imageUrl?:string};
function cookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)}
async function normalizeImageUrl(value?:string){
  if(!value) return '';
  if(/^https:\/\//i.test(value)) return value;
  const match=value.match(/^data:([^;]+);base64,(.+)$/s);
  if(match) return storeBase64Image(match[2],match[1],'published');
  return '';
}
export async function POST(request:Request){
 try{
  const {caption,imageUrl}=await readJson<Body>(request);
  const token=decodeURIComponent(cookie(request,'ig_access_token')||process.env.INSTAGRAM_ACCESS_TOKEN||'');
  const userId=process.env.INSTAGRAM_USER_ID||'';
  if(!token||!userId) return json({error:'Instagram is not connected. Use Connect Instagram first or configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID.'},401);
  const publicImageUrl=await normalizeImageUrl(imageUrl);
  if(!publicImageUrl) return json({error:'A public HTTPS image URL is required. Attach Vercel Blob or provide an HTTPS image URL.'},400);
  const params=new URLSearchParams({image_url:publicImageUrl,caption:caption||'',access_token:token});
  const create=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:params});
  const container=await create.json(); if(!create.ok) return json({error:container?.error?.message||'Instagram media creation failed'},502);
  const publishBody=new URLSearchParams({creation_id:container.id,access_token:token});
  const pub=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media_publish`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:publishBody});
  const result=await pub.json(); if(!pub.ok)return json({error:result?.error?.message||'Instagram publish failed'},502);
  return json({ok:true,id:result.id,imageUrl:publicImageUrl});
 }catch(e:any){return json({error:e?.message||'Instagram publishing failed'},500)}
}
