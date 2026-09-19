import { json } from '@/lib/server';

function cookie(request:Request,name:string){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.slice(name.length+1)}
export async function GET(request:Request){
 try{
  const u=new URL(request.url); const code=u.searchParams.get('code'); const state=u.searchParams.get('state'); const saved=cookie(request,'ig_oauth_state');
  if(!code||!state||state!==saved) return json({error:'Invalid Instagram OAuth state or missing code'},400);
  const body=new URLSearchParams({client_id:process.env.INSTAGRAM_APP_ID||'',client_secret:process.env.INSTAGRAM_APP_SECRET||'',grant_type:'authorization_code',redirect_uri:process.env.INSTAGRAM_REDIRECT_URI||`${u.origin}/api/auth/instagram/callback`,code});
  const tokenRes=await fetch('https://api.instagram.com/oauth/access_token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body}); const token=await tokenRes.json(); if(!tokenRes.ok) return json({error:token?.error_message||'Instagram token exchange failed'},502);
  const accessToken=token.access_token; const longRes=await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(process.env.INSTAGRAM_APP_SECRET||'')}&access_token=${encodeURIComponent(accessToken)}`); const long=await longRes.json();
  const finalToken=long.access_token||accessToken; const profileRes=await fetch(`https://graph.instagram.com/me?fields=id,user_id,username&access_token=${encodeURIComponent(finalToken)}`); const profile=await profileRes.json();
  const response=new Response(`<script>window.close();location.href='/'</script>`,{status:200,headers:{'content-type':'text/html; charset=utf-8'}}); response.headers.append('Set-Cookie',`ig_access_token=${encodeURIComponent(finalToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000${process.env.NODE_ENV==='production'?'; Secure':''}`); response.headers.append('Set-Cookie',`ig_profile=${encodeURIComponent(JSON.stringify(profile))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=5184000${process.env.NODE_ENV==='production'?'; Secure':''}`); return response;
 }catch(e:any){return json({error:e?.message||'Instagram OAuth callback failed'},500)}
}
