export const runtime = 'edge';

export async function POST() {
  const captions = [
    "Your brand, your story. 🚀",
    "Sharing made easy ✨",
    "One click, all socials 📲",
    "Content that travels everywhere 🌍",
    "Create once, share everywhere 🔁"
  ];
  const caption = captions[Math.floor(Math.random() * captions.length)];
  return new Response(JSON.stringify({ caption }), { status: 200 });
}
