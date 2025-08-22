'use client';
import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [caption, setCaption] = useState('');

  async function handlePost() {
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

  return (
    <main style={{ fontFamily:'system-ui, sans-serif', padding:24, maxWidth:820, margin:'0 auto' }}>
      <h1>Postara — Upload & Share</h1>
      <input id="file" type="file" accept="image/*,video/*" />
      <textarea
        placeholder="Caption (optional)"
        value={caption}
        onChange={e=>setCaption(e.target.value)}
        rows={3}
        style={{ display:'block', width:'100%', marginTop:12, padding:8 }}
      />
      <button onClick={handlePost} style={{ marginTop:12, padding:'10px 14px', fontWeight:600 }}>
        Upload & Post
      </button>
      <div style={{ marginTop:12 }}><b>Status:</b> {status}</div>
    </main>
  );
}
