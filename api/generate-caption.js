// api/generate-caption.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "No file URL provided" });

    // Your Ayrshare API key (from environment variable)
    const API_KEY = process.env.AYRSHARE_API_KEY;

    // Generate AI captions
    const response = await fetch("https://api.ayrshare.com/v1/caption", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        // you can adjust options if needed
        n: 5, 
        tone: "engaging",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Caption generation failed" });
    }

    // Assume API returns { captions: ["caption1", "caption2", ...] }
    return res.status(200).json({ captions: data.captions || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
