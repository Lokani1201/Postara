// api/generate-caption.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ⚠️ put your key in Vercel Environment Variables
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    });

    const captions = completion.choices[0].message.content;
    res.status(200).json({ captions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Caption generation failed." });
  }
}
