import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Use your Ayrshare API key from environment variables
    const API_KEY = process.env.AYRSHARE_API_KEY;

    const response = await fetch("https://app.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        post: text,
        platforms: ["twitter"], // dummy platform, just for AI caption
      }),
    });

    const data = await response.json();

    // Return the AI-generated caption
    res.status(200).json({ caption: data.post || "Try again" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Caption generation failed" });
  }
}
