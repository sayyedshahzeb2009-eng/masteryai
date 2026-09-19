'use client';

import { useState } from 'react';
import { Bell, Bot, CalendarDays, ChevronRight, CircleHelp, FileText, Image, Instagram, LayoutDashboard, Menu, Plus, Search, Settings, Sparkles, BarChart3, Video, WandSparkles, Youtube } from 'lucide-react';

const news = [
  { title: 'Bigg Boss house gets a new captain after intense task', source: 'Entertainment Desk', time: '8 min ago', tag: 'Trending' },
  { title: 'New OTT series announces release date and first look', source: 'OTT Updates', time: '24 min ago', tag: 'Fresh' },
  { title: 'Weekend episode brings a surprise twist for contestants', source: 'TV Buzz', time: '41 min ago', tag: 'Hot' },
  { title: 'JioHotstar reveals upcoming reality-show lineup', source: 'Streaming News', time: '1 hr ago', tag: 'New' },
];

const nav = [
  ['Overview', LayoutDashboard], ['News radar', Search], ['Create', WandSparkles], ['Content studio', Image], ['Calendar', CalendarDays], ['Analytics', BarChart3],
];

export default function Home() {
  const [active, setActive] = useState('Overview');
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(true);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brandmark">M</div><div><strong>MasterYAI</strong><span> content OS</span></div></div>
        <nav className="nav">
          <div className="navlabel">Workspace</div>
          {nav.map(([label, Icon]) => <button key={label as string} onClick={() => setActive(label as string)} className={`navitem ${active === label ? 'active' : ''}`}><Icon size={16}/><span>{label as string}</span></button>)}
          <div className="navlabel">Tools</div>
          <button className="navitem"><FileText size={16}/><span>AI Writer</span></button>
          <button className="navitem"><Bot size={16}/><span>AI Voice</span></button>
          <button className="navitem"><Video size={16}/><span>AI Video</span></button>
          <button className="navitem"><Settings size={16}/><span>Settings</span></button>
        </nav>
        <div className="sidebarBottom"><div className="agentCard"><div className="agentTop"><span>AI Agent</span><span className="dot"/></div><div className="agentMeta">{running ? 'Scanning for new stories' : 'Automation paused'}</div></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="crumb">Workspace / <strong>{active}</strong></div><div className="topActions"><button className="iconBtn" aria-label="Search"><Search size={16}/></button><button className="iconBtn" aria-label="Notifications"><Bell size={16}/></button><div className="avatar">SS</div></div></header>
        <section className="content">
          <div className="hero"><div><div className="eyebrow">AI content command center</div><h1>Good evening. Let AI run your content.</h1><p>Discover fresh stories, turn them into polished social posts, and publish them on schedule — from one calm workspace.</p></div><button className="primary" onClick={() => setRunning(!running)}>{running ? 'Pause automation' : 'Start automation'}</button></div>

          <div className="stats">
            <div className="stat"><div className="statLabel">Stories found</div><div className="statValue">24</div><div className="statFoot green">+18% this week</div></div>
            <div className="stat"><div className="statLabel">Posts created</div><div className="statValue">18</div><div className="statFoot">6 waiting for review</div></div>
            <div className="stat"><div className="statLabel">Published</div><div className="statValue">12</div><div className="statFoot green">98.4% success rate</div></div>
            <div className="stat"><div className="statLabel">Next post</div><div className="statValue">7:00</div><div className="statFoot">Today · Instagram</div></div>
          </div>

          <div className="grid">
            <div>
              <div className="card"><div className="cardHead"><div><div className="cardTitle">News radar</div><div className="sub">Fresh stories your agent discovered</div></div><span className="pill">LIVE</span></div><div className="newsList">{news.map((item, i) => <div className="news" key={item.title}><div className="thumb">{i === 0 ? 'BB' : i === 1 ? 'OTT' : i === 2 ? 'TV' : 'JH'}</div><div className="newsBody"><div className="newsTitle">{item.title}</div><div className="newsMeta">{item.source} · {item.time} · <strong>{item.tag}</strong></div></div><button className="action">Create <ChevronRight size={12} style={{verticalAlign:'middle'}}/></button></div>)}</div></div>
              <div className="automation"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><h3>AI newsroom is {running ? 'active' : 'paused'}</h3><p>Scanning approved sources and preparing the next post.</p></div><Bot size={23}/></div><div className="progress"><span/></div><div className="automationFoot"><span>Pipeline health · 72%</span><span>Next scan in 11 min</span></div></div>
            </div>

            <div>
              <div className="card"><div className="cardHead"><div><div className="cardTitle">Connected channels</div><div className="sub">Where your AI can publish</div></div><button className="iconBtn" onClick={() => setConnected(!connected)} aria-label="Connect"><Plus size={15}/></button></div>
                <div className="platform"><div className="platformIcon"><Instagram size={17}/></div><div><div className="platformName">Instagram</div><div className="platformStatus">@masteryai.demo</div></div><div className="platformRight">Connected</div></div>
                <div className="platform"><div className="platformIcon"><Youtube size={17}/></div><div><div className="platformName">YouTube</div><div className="platformStatus">Channel not connected</div></div><button className="action" onClick={() => setConnected(true)}>{connected ? 'Connected' : 'Connect'}</button></div>
                <div className="platform"><div className="platformIcon"><Sparkles size={16}/></div><div><div className="platformName">AI profile</div><div className="platformStatus">Entertainment · Hindi + Hinglish</div></div><div className="platformRight">Ready</div></div>
              </div>
              <div className="card" style={{marginTop:14}}><div className="cardHead"><div><div className="cardTitle">Today&apos;s schedule</div><div className="sub">Your publishing queue</div></div><CalendarDays size={16}/></div><div className="platform"><div className="platformIcon">01</div><div><div className="platformName">Entertainment poster</div><div className="platformStatus">Instagram · 7:00 PM</div></div><span className="pill">Ready</span></div><div className="platform"><div className="platformIcon">02</div><div><div className="platformName">OTT daily roundup</div><div className="platformStatus">Instagram · 10:00 PM</div></div><span className="pill">Draft</span></div></div>
            </div>
          </div>
          <div className="footerNote"><CircleHelp size={12} style={{verticalAlign:'-2px',marginRight:5}}/> MasterYAI is designed around official platform connections. API keys stay server-side.</div>
        </section>
      </main>
    </div>
  );
}
