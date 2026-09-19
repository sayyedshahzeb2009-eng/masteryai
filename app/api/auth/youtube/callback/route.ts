import { json } from '@/lib/server';
function cookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)}
export async function GET(request:Request){
 try{
  const u=new URL(request.url); const code=u.searchParams.get('code'); const state=u.searchParams.get('state'); const saved=cookie(request,'yt_oauth_state');
  if(!code||!state||state!==saved) return json({error:'Invalid YouTube OAuth state or missing code'},400);
  const body=new URLSearchParams({client_id:process.env.YOUTUBE_CLIENT_ID||'',client_secret:process.env.YOUTUBE_CLIENT_SECRET||'',code,grant_type:'authorization_code',redirect_uri:process.env.YOUTUBE_REDIRECT_URI||`${u.origin}/api/auth/youtube/callback`});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body}); const token=await r.json(); if(!r.ok) return json({error:token?.error_description||'YouTube token exchange failed'},502);
  const response=new Response(`<script>window.close();location.href='/'</script>`,{status:200,headers:{'content-type':'text/html; charset=utf-8'}}); response.headers.append('Set-Cookie',`yt_refresh_token=${encodeURIComponent(token.refresh_token||'')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${process.env.NODE_ENV==='production'?'; Secure':''}`); response.headers.append('Set-Cookie',`yt_access_token=${encodeURIComponent(token.access_token||'')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(60,(token.expires_in||3600)-60)}${process.env.NODE_ENV==='production'?'; Secure':''}`); return response;
 }catch(e:any){return json({error:e?.message||'YouTube OAuth callback failed'},500)}
}
