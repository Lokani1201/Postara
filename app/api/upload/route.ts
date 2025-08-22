import { put } from '@vercel/blob';
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ message: 'Ingen fil mottagen.' }), { status: 400 });
    }
    const filename = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const blob = await put(filename, file, { access: 'public' });
    return Response.json({ url: blob.url });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err?.message || 'Upload error' }), { status: 500 });
  }
}
