export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { caption, mediaUrl, isVideo } = await req.json();

    // This gets your secret key from Vercel Settings → Environment Variables
    const key = process.env.AYRSHARE_KEY;
    if (!key) {
      return new Response(JSON.stringify({ message: 'AYRSHARE_KEY missing on server.' }), { status: 500 });
    }

    const body: any = {
      post: caption || '',
      platforms: ['all'],
      mediaUrls: mediaUrl ? [mediaUrl] : []
    };
    if (isVideo) body.isVideo = true;

    const res = await fetch('https://api.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err?.message || 'Post error' }), { status: 500 });
  }
}
