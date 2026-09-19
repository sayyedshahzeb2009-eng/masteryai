import { json, readJson } from '@/lib/server';
import { dbQuery, hasDatabase } from '@/lib/db';

type PostBody={platform?:string;title?:string;caption?:string;hashtags?:string[];imageUrl?:string;scheduledAt?:string;status?:string};

export async function GET(){
  if(!hasDatabase()) return json({posts:[],configured:false});
  const result=await dbQuery(`select id,platform,status,title,caption,hashtags,image_url as "imageUrl",scheduled_at as "scheduledAt",published_at as "publishedAt",platform_post_id as "platformPostId",created_at as "createdAt" from posts order by coalesce(scheduled_at,created_at) desc limit 100`);
  return json({posts:result.rows,configured:true});
}

export async function POST(request:Request){
 try{
  if(!hasDatabase()) return json({error:'DATABASE_URL is not configured. Add a PostgreSQL database to enable saved drafts and schedules.'},503);
  const body=await readJson<PostBody>(request);
  if(!body.platform) return json({error:'platform is required'},400);
  const result=await dbQuery(`insert into posts(platform,status,title,caption,hashtags,image_url,scheduled_at) values($1,$2,$3,$4,$5,$6,$7) returning id,platform,status,title,caption,hashtags,image_url as "imageUrl",scheduled_at as "scheduledAt"`,[body.platform,body.status||'draft',body.title||null,body.caption||'',body.hashtags||[],body.imageUrl||null,body.scheduledAt?new Date(body.scheduledAt):null]);
  return json({post:result.rows[0]},201);
 }catch(e:any){return json({error:e?.message||'Could not save post'},500)}
}
