'use client';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [caption, setCaption] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Inline SVG icons (no images needed)
  const Icon = {
    instagram: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Instagram">
        <path fill="#E1306C" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"/>
        <circle cx="12" cy="12" r="3.5" fill="#fff"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
      </svg>
    ),
    facebook: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Facebook">
        <rect width="24" height="24" rx="5" fill="#1877F2"/>
        <path fill="#fff" d="M13.5 21v-7h2.4l.4-2.8H13.5V9.1c0-.8.2-1.3 1.4-1.3h1V5.3c-.5-.1-1.3-.2-2.1-.2-2.1 0-3.5 1.3-3.5 3.6v2H8v2.8h2.3V21h3.2z"/>
      </svg>
    ),
    twitter: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="X / Twitter">
        <rect width="24" height="24" rx="5" fill="#000"/>
        <path fill="#fff" d="M17.5 6.1L13 11.2l4.9 6.7h-2.3l-3.8-5.1-4.3 5.1H5.2l5-5.9-4.7-6.7H8l3.6 4.9 4.1-4.9h1.8z"/>
      </svg>
    ),
    tiktok: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="TikTok">
        <rect width="24" height="24" rx="5" fill="#111827"/>
        <path fill="#25F4EE" d="M14.5 5.2v7.5a3.7 3.7 0 1 1-3.7-3.7v2a1.7 1.7 0 1 0 1.7 1.7V3.8c.6.9 1.4 1.4 2 1.4h0z"/>
        <path fill="#FE2C55" d="M16.6 8.6a5.9 5.9 0 0 0 2.9.8v2a7.7 7.7 0 0 1-2.9-.7v3A3.7 3.7 0 1 1 13 10.7v2a1.7 1.7 0 1 0 1.7 1.7V5.2c.6 1.8 1.4 2.9 1.9 3.4z"/>
      </svg>
    ),
    youtube: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="YouTube">
        <rect width="24" height="24" rx="5" fill="#FF0000"/>
        <path fill="#fff" d="M10 15.5v-7l6 3.5-6 3.5z"/>
      </svg>
    ),
    linkedin: (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-label="LinkedIn">
        <rect width="24" height="24" rx="5" fill="#0A66C2"/>
        <rect x="5" y="9" width="3" height="10" fill="#fff"/>
        <circle cx="6.5" cy="6.5" r="1.5" fill="#fff"/>
        <path fill="#fff" d="M11 9h3v1.5c.5-1 1.7-1.8 3.2-1.8 2.3 0 3.8 1.5 3.8 4.4V19h-3v-5c0-1.5-.7-2.3-2-2.3-1.3 0-2 .9-2 2.4V19h-3V9z"/>
      </svg>
    )
  };

  async function handleUploadAndPost() {
    const input = document.getElementById('file') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) { alert('Choose a file'); return; }

    try {
      setStatus('Uploading...');
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson?.message || 'Upload failed');

      setFileUrl(upJson.url);

      setStatus('Posting...');
      const isVideo = file.type.startsWith('video');
      const postRes = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ caption, mediaUrl: upJson.url, isVideo })
      });
      const data = await postRes.json();
      if (!postRes.ok) throw new Error(data?.message || 'Post failed');

      setStatus('Done ✔');
      alert('Posted! Check Ayrshare dashboard.');
      console.log('Ayrshare:', data);
    } catch (e:any) {
      setStatus('Error: ' + e.message);
      alert('Error: ' + e.message);
    }
  }

  async function handleGenerateCaption() {
    try {
      setStatus('Generating caption...');
      const res = await fetch('/api/caption', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Caption error');
      setCaption(data.caption);
      setStatus('Caption ready ✔');
    } catch (e:any) {
      setStatus('Error: ' + e.message);
    }
  }

  return (
    <main style={{ fontFamily:'system-ui, sans-serif', padding:24, maxWidth:900, margin:'0 auto' }}>
      <header style={{ textAlign:'center', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:28 }}>Postara — One click. Post everywhere.</h1>
        <p style={{ color:'#6b7280', marginTop:6 }}>Upload → Generate caption → Post to all → Download file</p>
      </header>

      <div style={{ display:'flex', gap:18, justifyContent:'center', alignItems:'center', padding:'12px 0', border:'1px solid #e5e7eb', borderRadius:10, marginBottom:16 }}>
        {Icon.instagram}{Icon.facebook}{Icon.twitter}{Icon.tiktok}{Icon.youtube}{Icon.linkedin}
      </div>

      <div style={{ display:'grid', gap:12 }}>
        <input id="file" type="file" accept="image/*,video/*" style={{ padding:10, border:'1px solid #e5e7eb', borderRadius:8 }}/>
        <textarea
          placeholder="Write a caption or click Generate Caption…"
          value={caption}
          onChange={e=>setCaption(e.target.value)}
          rows={4}
          style={{ padding:10, border:'1px solid #e5e7eb', borderRadius:8 }}
        />
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={handleGenerateCaption} style={{ padding:'10px 16px', fontWeight:600, background:'#10b981', color:'#fff', borderRadius:8, border:'none', cursor:'pointer' }}>
            Generate Caption
          </button>
          <button onClick={handleUploadAndPost} style={{ padding:'10px 16px', fontWeight:600, background:'#4f46e5', color:'#fff', borderRadius:8, border:'none', cursor:'pointer' }}>
            Upload & Post
          </button>
          {fileUrl && (
            <a href={fileUrl} download style={{ padding:'10px 16px', fontWeight:600, background:'#f59e0b', color:'#fff', borderRadius:8, textDecoration:'none' }}>
              Download File
            </a>
          )}
        </div>
      </div>

      <div style={{ marginTop:16, color:'#111827' }}>
        <b>Status:</b> {status}
      </div>
    </main>
  );
}
