export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "No text provided" });

    // Use the Ayrshare API key from environment variables
    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not set" });

    // Example: call Ayrshare AI endpoint to generate captions
    const response = await fetch("https://app.ayrshare.com/api/social/ai/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, numberOfCaptions: 5 }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "AI error" });
    }

    res.status(200).json({ captions: data.captions || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error generating captions" });
  }
}
