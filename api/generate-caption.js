import fetch from "node-fetch";

const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
    }

    // Example API request to Ayrshare for AI caption (adjust endpoint if needed)
    const response = await fetch("https://app.ayrshare.com/api/caption", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    // Return captions
    res.status(200).json({ captions: data.captions || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI caption generation failed" });
  }
}
