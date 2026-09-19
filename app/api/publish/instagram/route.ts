import { json, readJson } from '@/lib/server';
type Body={caption:string;imageUrl?:string};
function cookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)}
export async function POST(request:Request){
 try{
  const {caption,imageUrl}=await readJson<Body>(request); const token=decodeURIComponent(cookie(request,'ig_access_token')||process.env.INSTAGRAM_ACCESS_TOKEN||''); const userId=process.env.INSTAGRAM_USER_ID||'';
  if(!token||!userId) return json({error:'Instagram is not connected. Use Connect Instagram first or configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID.'},401);
  if(!imageUrl||!/^https:\/\//i.test(imageUrl)) return json({error:'Instagram image publishing requires a public HTTPS image URL. Configure storage (for example Cloudinary/S3) before publishing generated images.'},400);
  const params=new URLSearchParams({image_url:imageUrl,caption:caption||'',access_token:token});
  const create=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:params}); const container=await create.json(); if(!create.ok) return json({error:container?.error?.message||'Instagram media creation failed'},502);
  const publishBody=new URLSearchParams({creation_id:container.id,access_token:token}); const pub=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media_publish`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:publishBody}); const result=await pub.json(); if(!pub.ok)return json({error:result?.error?.message||'Instagram publish failed'},502);
  return json({ok:true,id:result.id});
 }catch(e:any){return json({error:e?.message||'Instagram publishing failed'},500)}
}
