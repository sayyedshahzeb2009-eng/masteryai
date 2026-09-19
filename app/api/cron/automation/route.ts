import { json } from '@/lib/server';
import { dbQuery, hasDatabase } from '@/lib/db';
import { storeBase64Image } from '@/lib/storage';

function authorized(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret) return false;
  return request.headers.get('authorization')===`Bearer ${secret}`;
}
function strip(value:string){return value.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();}
function tag(xml:string,name:string){const m=xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?strip(m[1]):'';}

async function claude(topic:string){
 const key=process.env.ANTHROPIC_API_KEY; if(!key) throw new Error('ANTHROPIC_API_KEY is not configured');
 const model=process.env.ANTHROPIC_MODEL||'claude-sonnet-4-6';
 const prompt=`Create a factual Instagram entertainment-news package from this story. Do not invent facts. Clearly label uncertain claims. Return only JSON with headline,caption,hashtags (array),imagePrompt,seoKeywords (array). Story: ${topic}`;
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:1200,messages:[{role:'user',content:prompt}]})});
 const data=await r.json(); if(!r.ok) throw new Error(data?.error?.message||'Claude request failed');
 const text=(data?.content||[]).filter((x:any)=>x.type==='text').map((x:any)=>x.text).join('').replace(/^```json\s*/,'').replace(/```$/,'').trim();
 return JSON.parse(text);
}
async function image(prompt:string){
 const key=process.env.GEMINI_API_KEY; if(!key) throw new Error('GEMINI_API_KEY is not configured');
 const model=process.env.GEMINI_IMAGE_MODEL||'gemini-3-pro-image';
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({model,input:[{type:'text',text:prompt}],response_format:{type:'image',mime_type:'image/png',aspect_ratio:'4:5',image_size:'1K'}})});
 const data=await r.json(); if(!r.ok) throw new Error(data?.error?.message||'Gemini request failed');
 if(!data?.output_image?.data) throw new Error('Gemini returned no image');
 return {data:data.output_image.data,mime:data.output_image.mime_type||'image/png'};
}
async function publishInstagram(imageUrl:string,caption:string){
 const token=process.env.INSTAGRAM_ACCESS_TOKEN; const userId=process.env.INSTAGRAM_USER_ID;
 if(!token||!userId) throw new Error('No Instagram automation credentials. Connect Instagram and ensure the OAuth token is stored, or set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID.');
 const params=new URLSearchParams({image_url:imageUrl,caption,access_token:token});
 const create=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:params});
 const container=await create.json(); if(!create.ok) throw new Error(container?.error?.message||'Instagram media creation failed');
 const pub=await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media_publish`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({creation_id:container.id,access_token:token})});
 const result=await pub.json(); if(!pub.ok) throw new Error(result?.error?.message||'Instagram publish failed');
 return result.id;
}

export async function GET(request:Request){
 if(!authorized(request)) return json({error:'Unauthorized cron request'},401);
 if(process.env.AUTOMATION_ENABLED!=='true') return json({ok:true,skipped:true,reason:'AUTOMATION_ENABLED is not true'});
 if(!hasDatabase()) return json({error:'DATABASE_URL is required for persistent automation'},503);
 try{
  const topic=process.env.AUTOMATION_TOPIC||'Bigg Boss Indian OTT entertainment news';
  const rss=`https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const response=await fetch(rss,{headers:{'User-Agent':'MasterYAI/1.0'},cache:'no-store'}); if(!response.ok) throw new Error(`News provider returned ${response.status}`);
  const xml=await response.text(); const stories=xml.split('<item>').slice(1,16).map(raw=>({title:tag(raw,'title'),link:tag(raw,'link'),source:tag(raw,'source'),published:tag(raw,'pubDate')})).filter(x=>x.title&&x.link);
  let story=null;
  for(const candidate of stories){const exists=await dbQuery('select id from news_items where url=$1 limit 1',[candidate.link]);if(!exists.rowCount){story=candidate;break;}}
  if(!story) return json({ok:true,skipped:true,reason:'No new story found'});
  const inserted=await dbQuery<{id:string}>('insert into news_items(source,title,url,published_at) values($1,$2,$3,$4) returning id',[story.source||'Google News',story.title,story.link,story.published?new Date(story.published):null]);
  const content=await claude(`${story.title}\nSource: ${story.source}\nURL: ${story.link}`);
  const generated=await image(content.imagePrompt||content.headline||story.title);
  const imageUrl=await storeBase64Image(generated.data,generated.mime,'automation');
  const shouldPublish=process.env.AUTO_PUBLISH==='true';
  let platformPostId:string|null=null;
  let status=shouldPublish?'published':'draft';
  if(shouldPublish) platformPostId=await publishInstagram(imageUrl,content.caption||content.headline||story.title);
  const saved=await dbQuery(`insert into posts(platform,source_news_id,status,title,caption,hashtags,image_url,published_at,platform_post_id,metadata) values('instagram',$1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,[inserted.rows[0].id,status,content.headline||story.title,content.caption||'',content.hashtags||[],imageUrl,platformPostId?new Date():null,platformPostId,{seoKeywords:content.seoKeywords||[],sourceUrl:story.link,source:story.source}]);
  return json({ok:true,postId:saved.rows[0].id,status,story:story.title,imageUrl,platformPostId});
 }catch(e:any){return json({error:e?.message||'Automation failed'},500)}
}
