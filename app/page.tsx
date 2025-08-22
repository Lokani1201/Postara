'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [status, setStatus] = useState('');
  const [caption, setCaption] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

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
    setStatus('Generating caption...');
    const res = await fetch('/api/caption', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setCaption(data.caption);
      setStatus('Caption ready ✔');
    } else {
      setStatus('Caption error');
    }
  }

  return (
    <main style={{ fontFamily:'system-ui, sans-serif', padding:24, maxWidth:820, margin:'0 auto', textAlign:'center' }}>
      <h1 style={{ fontSize:'2rem', marginBottom:20 }}>🚀 Postara</h1>

      <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:20 }}>
        <Image src="/facebook.png" alt="Facebook" width={40} height={40}/>
        <Image src="/instagram.png" alt="Instagram" width={40} height={40}/>
        <Image src="/twitter.png" alt="Twitter" width={40} height={40}/>
        <Image src="/tiktok.png" alt="TikTok" width={40} height={40}/>
        <Image src="/youtube.png" alt="YouTube" width={40} height={40}/>
        <Image src="/linkedin.png" alt="LinkedIn" width={40} height={40}/>
      </div>

      <input id="file" type="file" accept="image/*,video/*" style={{ margin:'10px 0' }}/>

      <textarea
        placeholder="Write a caption or generate one..."
        value={caption}
        onChange={e=>setCaption(e.target.value)}
        rows={3}
        style={{ display:'block', width:'100%', marginTop:12, padding:8 }}
      />

      <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:12 }}>
        <button onClick={handleUploadAndPost} style={{ padding:'10px 16px', fontWeight:600, background:'#4f46e5', color:'#fff', borderRadius:6 }}>
          Upload & Post
        </button>
        <button onClick={handleGenerateCaption} style={{ padding:'10px 16px', fontWeight:600, background:'#10b981', color:'#fff', borderRadius:6 }}>
          Generate Caption
        </button>
        {fileUrl && (
          <a href={fileUrl} download style={{ padding:'10px 16px', fontWeight:600, background:'#f59e0b', color:'#fff', borderRadius:6, textDecoration:'none' }}>
            Download File
          </a>
        )}
      </div>

      <div style={{ marginTop:20 }}><b>Status:</b> {status}</div>
    </main>
  );
}
