import { json } from '@/lib/server';

export async function GET(request:Request){
 const appId=process.env.INSTAGRAM_APP_ID; const redirect=process.env.INSTAGRAM_REDIRECT_URI||`${new URL(request.url).origin}/api/auth/instagram/callback`;
 if(!appId) return json({error:'INSTAGRAM_APP_ID is not configured. Add it to your server environment.'},500);
 const state=crypto.randomUUID(); const url=new URL('https://www.instagram.com/oauth/authorize');
 url.searchParams.set('client_id',appId); url.searchParams.set('redirect_uri',redirect); url.searchParams.set('response_type','code'); url.searchParams.set('scope','instagram_business_basic,instagram_business_content_publish');
 const response=new Response(null,{status:302,headers:{Location:url.toString()}}); response.headers.append('Set-Cookie',`ig_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${process.env.NODE_ENV==='production'?'; Secure':''}`); return response;
}
