// api/generate-caption.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const API_KEY = process.env.AYRSHARE_API_KEY; // your environment variable

    const response = await fetch("https://app.ayrshare.com/api/social/post/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        count: 5, // generate 5 captions
      }),
    });

    const data = await response.json();

    if (!data.captions) {
      return res.status(500).json({ error: "No captions returned from API" });
    }

    res.status(200).json({ captions: data.captions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
