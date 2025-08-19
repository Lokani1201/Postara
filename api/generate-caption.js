// api/generate-caption.js

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA"; // Your Ayrshare API key

    // Call AI caption generator (mock example)
    const response = await fetch("https://api.ayrshare.com/v1/social/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        text: text,
        max_results: 5
      })
    });

    const data = await response.json();

    // Example: assume API returns { captions: ["caption1", "caption2"] }
    if (!data.captions) {
      return res.status(500).json({ error: "No captions returned from API" });
    }

    res.status(200).json({ captions: data.captions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
