import { json, readJson } from '@/lib/server';

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
  const xml=await response.text(); const items=xml.split('<item>').slice(1,11).map((raw,i)=>({id:String(i),title:tag(raw,'title'),link:tag(raw,'link'),source:tag(raw,'source'),published:tag(raw,'pubDate')})).filter(x=>x.title);
  return json({items});
 }catch(e:any){ return json({error:e?.message||'News scan failed'},500); }
}
