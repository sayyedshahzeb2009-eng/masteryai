import { json } from '@/lib/server';
import { dbQuery, hasDatabase } from '@/lib/db';
function cookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)}
export async function GET(request:Request){
 try{
  const u=new URL(request.url); const code=u.searchParams.get('code'); const state=u.searchParams.get('state'); const saved=cookie(request,'yt_oauth_state');
  if(!code||!state||state!==saved) return json({error:'Invalid YouTube OAuth state or missing code'},400);
  const body=new URLSearchParams({client_id:process.env.YOUTUBE_CLIENT_ID||'',client_secret:process.env.YOUTUBE_CLIENT_SECRET||'',code,grant_type:'authorization_code',redirect_uri:process.env.YOUTUBE_REDIRECT_URI||`${u.origin}/api/auth/youtube/callback`});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body}); const token=await r.json(); if(!r.ok) return json({error:token?.error_description||'YouTube token exchange failed'},502);
  const channelRes=await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',{headers:{Authorization:`Bearer ${token.access_token}`}}); const channel=await channelRes.json(); const item=channel?.items?.[0];
  const accountId=String(item?.id||'youtube-default');
  if(hasDatabase()) await dbQuery(`insert into connected_accounts(provider,account_id,account_name,access_token,refresh_token,token_expires_at,metadata) values('youtube',$1,$2,$3,$4,now()+make_interval(secs => $5),$6) on conflict(provider,account_id) do update set account_name=excluded.account_name,access_token=excluded.access_token,refresh_token=coalesce(excluded.refresh_token,connected_accounts.refresh_token),token_expires_at=excluded.token_expires_at,metadata=excluded.metadata,updated_at=now()`,[accountId,item?.snippet?.title||'YouTube',token.access_token,token.refresh_token||null,Number(token.expires_in||3600),item?.snippet||{}]);
  const response=new Response(`<script>window.close();location.href='/'</script>`,{status:200,headers:{'content-type':'text/html; charset=utf-8'}}); response.headers.append('Set-Cookie',`yt_refresh_token=${encodeURIComponent(token.refresh_token||'')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${process.env.NODE_ENV==='production'?'; Secure':''}`); response.headers.append('Set-Cookie',`yt_access_token=${encodeURIComponent(token.access_token||'')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(60,(token.expires_in||3600)-60)}${process.env.NODE_ENV==='production'?'; Secure':''}`); return response;
 }catch(e:any){return json({error:e?.message||'YouTube OAuth callback failed'},500)}
}
