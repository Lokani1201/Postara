export const runtime = 'edge';

export async function POST() {
  // simple demo caption generator (can replace with AI later)
  const captions = [
    "Your brand, your story. 🚀",
    "Sharing made easy ✨",
    "One click, all socials 📲",
    "Content that travels everywhere 🌍"
  ];
  const caption = captions[Math.floor(Math.random() * captions.length)];
  return new Response(JSON.stringify({ caption }), { status: 200 });
}
