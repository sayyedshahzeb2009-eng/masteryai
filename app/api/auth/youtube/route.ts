import { json } from '@/lib/server';
export async function GET(request:Request){
 const clientId=process.env.YOUTUBE_CLIENT_ID; const redirect=process.env.YOUTUBE_REDIRECT_URI||`${new URL(request.url).origin}/api/auth/youtube/callback`;
 if(!clientId) return json({error:'YOUTUBE_CLIENT_ID is not configured. Add it to your server environment.'},500);
 const state=crypto.randomUUID(); const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 url.searchParams.set('client_id',clientId); url.searchParams.set('redirect_uri',redirect); url.searchParams.set('response_type','code'); url.searchParams.set('scope','https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'); url.searchParams.set('access_type','offline'); url.searchParams.set('prompt','consent'); url.searchParams.set('state',state);
 const response=new Response(null,{status:302,headers:{Location:url.toString()}}); response.headers.append('Set-Cookie',`yt_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${process.env.NODE_ENV==='production'?'; Secure':''}`); return response;
}
