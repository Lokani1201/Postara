// api/generate-caption.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Replace with your API key
    const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

    const response = await fetch("https://app.ayrshare.com/api/social/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: errorData.message || "API error" });
    }

    const data = await response.json();

    // Return the AI-generated caption
    return res.status(200).json({ caption: data.caption || "" });
  } catch (error) {
    console.error("Error generating caption:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
