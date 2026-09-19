import { json, readJson } from '@/lib/server';
import { dbQuery, hasDatabase } from '@/lib/db';

type Body = { topic?: string };
function strip(value:string){ return value.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim(); }
function tag(xml:string,name:string){ const m=xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i')); return m?strip(m[1]):''; }

export async function POST(request:Request){
 try{
  const {topic='Bigg Boss and Indian OTT entertainment news'}=await readJson<Body>(request);
  const q=encodeURIComponent(topic);
  const url=`https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  const response=await fetch(url,{headers:{'User-Agent':'MasterYAI/1.0'},cache:'no-store'});
  if(!response.ok) return json({error:`News provider returned ${response.status}`},502);
  const xml=await response.text();
  const items=xml.split('<item>').slice(1,11).map((raw,i)=>({id:String(i),title:tag(raw,'title'),link:tag(raw,'link'),source:tag(raw,'source'),published:tag(raw,'pubDate')})).filter(x=>x.title);
  if(hasDatabase()) for(const item of items){ await dbQuery(`insert into news_items(source,title,url,published_at) values($1,$2,$3,$4) on conflict(url) do nothing`,[item.source||'Google News',item.title,item.link,item.published?new Date(item.published):null]); }
  return json({items,stored:hasDatabase()});
 }catch(e:any){ return json({error:e?.message||'News scan failed'},500); }
}
