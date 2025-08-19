// api/generate-caption.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Your Ayrshare API key
    const AYRSHARE_API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

    // Call Ayrshare AI caption generation endpoint
    const response = await fetch("https://app.ayrshare.com/api/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
      },
      body: JSON.stringify({
        url: fileUrl,
        count: 5 // number of AI captions to generate
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.message || "Caption generation failed" });
    }

    // result should include captions array
    res.status(200).json({ captions: result.captions || [] });
  } catch (error) {
    console.error("Error generating captions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
